"use strict";

// Importing modules
import * as IGDB from "./APIs/igdb_api.js";
import * as Utilities from "./utilities_module.js";

// Global variables
let game;
let previousGame;
let nextGame;

// Main entry point
requestPageData();

/**
 * Fetches and processes game data for the current page.
 */
async function requestPageData() {
  const id = new URLSearchParams(window.location.search).get("id") ?? "1";

  // Fetch games data (current, previous, and next)
  let games = await IGDB.requestGames("*, genres.*, websites.*, videos.*, collections.*, franchises.*, cover.*, player_perspectives.*, game_modes.*, themes.*, involved_companies.*, involved_companies.company.*, game_engines.*, platforms.*, language_supports.*, language_supports.language.*, language_supports.language_support_type.*, age_ratings.*, age_ratings.content_descriptions.*, age_ratings.organization.*, release_dates.*, release_dates.platform.*, release_dates.release_region.*, release_dates.status.*, external_games.*, dlcs.*, dlcs.cover.*, expansions.*, expansions.cover.*, artworks.*, screenshots.*", "", 3, `id = (${parseInt(id) - 1},${id},${parseInt(id) + 1})`);
  games = IGDB.getCovers(games);

  // Assign current, previous, and next games
  for (let i = 0; i < games.length; i++) {
    if (games[i].id == id) {
      game = games[i];
    } else if (game == null) {
      previousGame = games[i];
    } else {
      nextGame = games[i];
    }
  }

  let versions = await IGDB.requestGames("*, cover.*, websites.*", "", "", `version_parent = ${game.id}`);
  versions = IGDB.getCovers(versions, true);
  game.versions = versions;

  game.dlcs = IGDB.getCovers(game.dlcs, true);
  game.expansions = IGDB.getCovers(game.expansions, true);

  // Update document title and format game data
  document.title = game.name;
  if (game.language_supports?.length > 0) game.language_supports = IGDB.formatLanguages(game.language_supports);
  if (game.age_ratings?.length > 0) game.age_ratings = IGDB.formatAgeRatings(game.age_ratings);
  if (game.websites?.length > 0) game.websites = IGDB.formatWebsites(game.websites);
  if (game.release_dates?.length > 0) game.release_dates = IGDB.formatReleases(game.release_dates);

  console.log("Game: ", game);

  // Fill the page with game data
  fillPage();
}

/**
 * Populates the page with game data.
 */
function fillPage() {
  fillTop();
  fillAbout();
  fillLanguages();
  fillAgeRatings();
  fillReleases();
  fillEditions();
  fillExpansions();
  fillDLCs();
  fillArtworks();
  fillScreenshots();
  fillVideos();

  const plot = document.querySelector("#main--plot");
  if (game.storyline) {
    plot.querySelector("p").innerHTML = game.storyline;
  } else {
    plot.remove();
  }

  createTableOfContents();
  createExternalLinks();
}

/**
 * Fills the top section of the page with game details.
 */
function fillTop() {
  const banner = document.querySelector("#banner");
  if (game.cover.hero_url) {
    const bannerBackground = banner.querySelector("#banner--background");
    bannerBackground.setAttribute("src", game.cover.hero_url);

    const logo = banner.querySelector("#banner--logo");
    Utilities.imageExists(game.cover.logo_url, (exists) => {
      if (exists) {
        logo.setAttribute("src", game.cover.logo_url);
      } else {
        logo.remove();
      }
    });
  } else {
    banner.remove();
  }

  const top = document.querySelector("#main--top");
  top.querySelector("h1").textContent = game.name;
  top.querySelector("small").textContent = game.first_release_date < Date.now() / 1000 ? `${Utilities.dateFromUnix(game.first_release_date)} (${Utilities.timeAgoFromUnix(game.first_release_date)})` : `${Utilities.dateFromUnix(game.first_release_date)}`;
  top.querySelector("p").textContent = game.summary;

  const cover = top.querySelector("img");
  Utilities.imageExists(game.cover.portrait_url, (exists) => {
    if (exists) {
      cover.setAttribute("src", game.cover.portrait_url);
    } else {
      cover.remove();
    }
  });

  const video = game.videos.find((v) => v.name.includes("Launch")) ?? game.videos.at(-1);
  top.querySelector("iframe").setAttribute("src", `https://www.youtube.com/embed/${video.video_id}?mute=1`);
}

/**
 * Fills the "About" section with game metadata.
 */
function fillAbout() {
  orderPlatforms();
  createAboutList("#main--about--platforms", game.platforms, "name");
  createAboutList("#main--about--genres", game.genres, "name");
  createAboutList("#main--about--game-modes", game.game_modes, "name");
  createAboutList("#main--about--player-perspectives", game.player_perspectives, "name");
  createAboutList("#main--about--themes", game.themes, "name");
  createAboutList(
    "#main--about--main-developers",
    game.involved_companies.filter((e) => e.developer).map((e) => e.company),
    "name"
  );
  createAboutList(
    "#main--about--supporting-developers",
    game.involved_companies.filter((e) => e.supporting).map((e) => e.company),
    "name"
  );
  createAboutList(
    "#main--about--publishers",
    game.involved_companies.filter((e) => e.publisher).map((e) => e.company),
    "name"
  );
  createAboutList("#main--about--game-engines", game.game_engines, "name");
  createAboutList("#main--about--series", game.collections, "name");
  createAboutList("#main--about--franchises", game.franchises, "name");
}

/**
 * Creates a list of items for the "About" section.
 */
function createAboutList(parent, array, key) {
  const container = document.querySelector(`${parent} td`);

  if (array?.length > 0) {
    for (let i = 0; i < array.length; i++) {
      const value = array[i];
      const a = document.createElement("a");
      a.textContent = value[key];
      container.append(a);

      if (i < array.length - 1) {
        container.innerHTML += ", ";
      }
    }
  } else {
    container.textContent = "-";
  }
}

/**
 * Orders platforms by family and generation.
 */
function orderPlatforms() {
  game.platforms.forEach((platform) => {
    if (platform.platform_family == null) platform.platform_family = -1;
    if (platform.slug == "linux") platform.platform_family = 0;
    if (platform.platform_family == 4) platform.platform_family = 6;
  });

  game.platforms = game.platforms.sort((a, b) => {
    if (a.platform_family !== b.platform_family) return a.platform_family - b.platform_family;
    else return a.generation - b.generation;
  });
}

/**
 * Fills the "Languages" section with supported languages.
 */
function fillLanguages() {
  const section = document.querySelector("#main--localization--languages");
  if (game.language_supports?.length > 0) {
    const table = section.querySelector("tbody");
    game.language_supports.forEach((language) => {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.textContent = language.language.name;
      tr.append(td);

      const tds = [];
      for (let i = 0; i < 3; i++) {
        const td = document.createElement("td");
        tds.push(td);
        tr.append(td);
      }

      tds[0].innerHTML = language.audio ? '<i class="fa-solid fa-check"></i>' : "";
      tds[1].innerHTML = language.subtitles ? '<i class="fa-solid fa-check"></i>' : "";
      tds[2].innerHTML = language.interface ? '<i class="fa-solid fa-check"></i>' : "";

      table.append(tr);
    });
  } else {
    section.remove();
  }
}

/**
 * Fills the "Age Ratings" section with rating information.
 */
function fillAgeRatings() {
  const section = document.querySelector("#main--localization--age-ratings");
  if (game.age_ratings?.length > 0) {
    game.age_ratings.forEach((rating) => {
      const element = section.querySelector(`#main--localization--age-ratings--${rating.organization}`);
      if (element) {
        element.querySelector("img").setAttribute("src", `/Assets/Age ratings/${rating.rating}.svg`);
        const tooltip = element.querySelector("my-tooltip");
        if (rating.descriptions?.length > 0) {
          rating.descriptions.forEach((desc) => {
            tooltip.innerHTML += desc + "<br>";
          });
        } else {
          tooltip.remove();
        }
      }
    });
  } else {
    section.remove();
  }
}

/**
 * Fills the "Releases" section with release dates and platforms.
 */
function fillReleases() {
  const parent = document.querySelector("#main--releases tbody");
  game.release_dates.forEach((release) => {
    const tr = document.createElement("tr");

    if (release.date == game.first_release_date && game.release_dates.length > 1) tr.style.fontWeight = 600;

    const tdDate = document.createElement("td");
    tdDate.textContent = Utilities.dateFromUnix(release.date);
    tr.append(tdDate);

    const tdRelease = document.createElement("td");
    tdRelease.textContent = release.release;
    tr.append(tdRelease);

    const tdPlatforms = document.createElement("td");
    const tdRegions = document.createElement("td");
    for (let i = 0; i < release.platforms.length; i++) {
      const platform = release.platforms[i];
      tdPlatforms.innerHTML += platform.names.join(", ") + (i < release.platforms.length - 1 ? "<br>" : "");
      tdRegions.innerHTML += platform.regions.join(", ") + (i < release.platforms.length - 1 ? "<br>" : "");
    }
    tr.append(tdPlatforms);
    tr.append(tdRegions);

    parent.append(tr);
  });
}

/**
 * Creates a table of contents for the page.
 */
function createTableOfContents() {
  const page = document.querySelector("main");
  const headings = page.querySelectorAll("h2, h3");
  const table = document.createElement("ul");

  let item = document.createElement("li");
  let link = document.createElement("a");
  link.href = `#banner`;
  link.textContent = "(Top)";
  item.append(link);
  table.append(item);

  headings.forEach((heading) => {
    item = document.createElement("li");
    link = document.createElement("a");
    link.href = `#${heading.parentElement.id}`;
    link.textContent = heading.textContent;

    if (heading.tagName == "H3") {
      link.style.paddingLeft = "1rem";
    }

    item.append(link);
    table.append(item);
  });

  document.querySelector("#nav--table-of-contents").append(table);
}

/**
 * Creates external links for the game.
 */
function createExternalLinks() {
  const grid = document.createElement("div");
  grid.classList.add("grid");

  game.websites.forEach((wb) => {
    const a = document.createElement("a");
    a.setAttribute("href", wb.url);
    a.setAttribute("target", "_blank");
    a.style.backgroundColor = wb.color;
    const img = document.createElement("img");
    if (Utilities.colorToLuma(wb.color) < 200) {
      img.style.filter = "invert(95%) sepia(100%) saturate(14%) hue-rotate(213deg) brightness(104%) contrast(104%)";
    }
    img.setAttribute("src", wb.icon);
    a.append(img);
    grid.append(a);
  });

  document.querySelector("#nav--external-links").append(grid);
}

function fillEditions() {
  const section = document.querySelector("#main--additional-content--editions");
  if (game.versions?.length > 0) {
    const template = section.querySelector("template");
    const cards = [];

    for (let i = 0; i < game.versions.length; i++) {
      let clone = template.content.cloneNode(true);
      let card = clone.querySelector(".card");
      template.parentElement.appendChild(clone);

      cards.push(card);
    }

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const version = game.versions[i];

      card.querySelector("b").textContent = version.name.replace(`${game.name}: `, "").replace(`${game.name} - `, "");

      const cover = card.querySelector(".cover");
      cover.style.backgroundImage = `url(${version.cover.portrait_url})`;

      const date = card.querySelector(".subtexts small");
      // date.textContent = version.name.replace(`${game.name}: `, "").replace(`${game.name} - `, "");

      card.setAttribute("href", `/HTML/games/?id=${version.id}`);
    }
  } else {
    section.remove();
  }
}

function fillExpansions() {
  const section = document.querySelector("#main--additional-content--expansions");
  if (game.expansions?.length > 0) {
    const template = section.querySelector("template");
    const cards = [];

    for (let i = 0; i < game.expansions.length; i++) {
      let clone = template.content.cloneNode(true);
      let card = clone.querySelector(".card");
      template.parentElement.appendChild(clone);

      cards.push(card);
    }

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const expansion = game.expansions[i];

      card.querySelector("b").textContent = expansion.name.replace(`${game.name}: `, "").replace(`${game.name} - `, "");

      const cover = card.querySelector(".cover");
      cover.style.backgroundImage = `url(${expansion.cover.portrait_url})`;

      const date = card.querySelector(".subtexts small");
      // date.textContent = expansion.name.replace(`${game.name}: `, "").replace(`${game.name} - `, "");

      card.setAttribute("href", `/HTML/games/?id=${expansion.id}`);
    }
  } else {
    section.remove();
  }
}

function fillDLCs() {
  const section = document.querySelector("#main--additional-content--dlcs");
  if (game.dlcs?.length > 0) {
    const template = section.querySelector("template");
    const cards = [];

    for (let i = 0; i < game.dlcs.length; i++) {
      let clone = template.content.cloneNode(true);
      let card = clone.querySelector(".card");
      template.parentElement.appendChild(clone);

      cards.push(card);
    }

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const dlc = game.dlcs[i];

      card.querySelector("b").textContent = dlc.name.replace(`${game.name}: `, "").replace(`${game.name} - `, "");

      const cover = card.querySelector(".cover");
      cover.style.backgroundImage = `url(${dlc.cover.portrait_url})`;

      const date = card.querySelector(".subtexts small");
      // date.textContent = game.name;

      card.setAttribute("href", `/HTML/games/?id=${dlc.id}`);
    }
  } else {
    section.remove();
  }
}

function fillArtworks() {
  const section = document.querySelector("#main--media--artworks");
  if (game.artworks?.length > 0) {
    const parent = section.querySelector("ul");
    game.artworks.forEach(artwork => {
      const li = document.createElement("li");
      li.classList.add("zoom");
      const img = document.createElement("img");
      img.src = IGDB.getImage(artwork.image_id, "landscape");

      li.addEventListener("click", () => enableMediaOverlay(artwork));

      li.append(img);
      parent.append(li);
    });
  } else {
    section.remove();
  }
}

function fillScreenshots() {
  const section = document.querySelector("#main--media--screenshots");
  if (game.screenshots?.length > 0) {
    const parent = section.querySelector("ul");
    game.screenshots.forEach((screenshot) => {
      const li = document.createElement("li");
      li.classList.add("zoom");
      const img = document.createElement("img");
      img.src = IGDB.getImage(screenshot.image_id, "landscape");

      li.addEventListener("click", () => enableMediaOverlay(screenshot));

      li.append(img);
      parent.append(li);
    });
  } else {
    section.remove();
  }
}

function fillVideos() {
  const section = document.querySelector("#main--media--videos");
  if (game.videos?.length > 0) {
    const parent = section.querySelector("ul");
    const template = section.querySelector("template");
    game.videos.forEach((video) => {
      const clone = template.content.firstElementChild.cloneNode(true);
      const div = clone.querySelector("div");
      div.style.backgroundImage = `url(${Utilities.getVideoThumbnail(video.video_id)})`;

       const span = clone.querySelector("span");
       span.textContent = video.name;

       clone.addEventListener("click", () => enableMediaOverlay(video));

      parent.append(clone);
    });
  } else {
    section.remove();
  }
}


const overlay = document.querySelector("#media-overlay");
const overlayImage = overlay.querySelector("img");
const overlayVideo = overlay.querySelector("iframe");
function enableMediaOverlay(element) {
  console.log("bjr");
  document.body.classList.add("stop-scrolling");
  overlay.addEventListener("click", disableMediaOverlay);
  
  if(element.image_id) {
    overlayImage.style.display = "block";
    overlayVideo.style.display = "none";
    overlayImage.setAttribute("src", "");
    overlayImage.setAttribute("src", IGDB.getImage(element.image_id, "hero"));
    overlayImage.onload = () => {
      overlay.setAttribute("show", "");
    };
  } else {
    overlayImage.style.display = "none";
    overlayVideo.style.display = "block";
    overlayVideo.setAttribute("src", `https://www.youtube.com/embed/${element.video_id}?autoplay=1`);
    overlay.setAttribute("show", "");
  }
}

function disableMediaOverlay(event) {
  if (event.target != overlay) return;
  
  overlayVideo.setAttribute("src", "");
  overlayImage.setAttribute("src", "");
  
  overlay.removeAttribute("show");
  document.body.classList.remove("stop-scrolling");
  overlay.removeEventListener("click", disableMediaOverlay);
}
