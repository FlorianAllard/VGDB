"use strict";

// Importing modules
import * as Utilities from "./utilities_module.js";
import * as IGDB from "./APIs/igdb_api.js";
import * as OpenCritic from "./APIs/opencritic_api.js";
import * as Speedrun from "./APIs/speedrun_api.js";
import * as IsThereAnyDeal from "./APIs/isthereanydeal_api.js";

// Global variables
let game;
let rating;
let reviews;
let timeToBeat;
let prices;

// Main entry point
Utilities.startLoading();
requestPageData();

/**
 * Fetches and processes game data for the current page.
 */
async function requestPageData() {
  const id = new URLSearchParams(window.location.search).get("id") ?? "1";

  // Fetch games data (current, previous, and next)
  let games = await IGDB.requestGames("*, genres.*, websites.*, videos.*, collections.*, franchises.*, cover.*, player_perspectives.*, game_modes.*, themes.*, involved_companies.*, involved_companies.company.*, game_engines.*, platforms.*, language_supports.*, language_supports.language.*, language_supports.language_support_type.*, age_ratings.*, age_ratings.content_descriptions.*, age_ratings.organization.*, release_dates.*, release_dates.platform.*, release_dates.release_region.*, release_dates.status.*, external_games.*, dlcs.*, dlcs.cover.*, expansions.*, expansions.cover.*, artworks.*, screenshots.*", "", 3, `id = ${id}`);
  games = await IGDB.getCovers(games);
  game = games[0];

  let versions = await IGDB.requestGames("*, cover.*, websites.*", "", "", `version_parent = ${game.id}`);
  [game.versions, game.dlcs, game.expansions] = await Promise.all([
    IGDB.getCovers(versions, true),
    IGDB.getCovers(game.dlcs, true),
    IGDB.getCovers(game.expansions, true)
  ]);

  // Update document title and format game data
  document.title = game.name;
  if (game.language_supports?.length > 0) game.language_supports = IGDB.formatLanguages(game.language_supports);
  if (game.age_ratings?.length > 0) game.age_ratings = IGDB.formatAgeRatings(game.age_ratings);
  if (game.websites?.length > 0) game.websites = IGDB.formatWebsites(game.websites);
  if (game.release_dates?.length > 0) game.release_dates = IGDB.formatReleases(game.release_dates);

  console.log("Game: ", game);

  rating = await OpenCritic.requestGame(game.name);
  console.log("Rating: ", rating);
  if(rating) {
    const reviewsData = await OpenCritic.requestReviews(rating.id);
    reviews = Array.isArray(reviewsData) ? reviewsData.slice(0, 6) : [];
    console.log("Reviews: ", reviews);
  }

  timeToBeat = await IGDB.requestTimeToBeat("*", "", "", `game_id = ${game.id}`);
  if(timeToBeat) timeToBeat.speedrun = await Speedrun.getWorldRecord(game.slug);
  console.log("Time to beat: ", timeToBeat);
  
  const itadGame = await IsThereAnyDeal.requestGame(game.slug);
  if (itadGame) {
    prices = await IsThereAnyDeal.requestPrices(itadGame.id);
    prices = prices[0];
    console.log("Prices: ", prices);
  }
 
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
  fillReviews();
  fillEditions();
  fillExpansions();
  fillDLCs();
  fillTimeToBeat();
  fillPrices();
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

  Utilities.stopLoading();
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
      if (game.cover.logo_url) {
        logo.setAttribute("src", game.cover.logo_url);
      } else {
        logo.remove();
      }
  } else {
    banner.remove();
  }

  const top = document.querySelector("#main--top");
  top.querySelector("h1").textContent = game.name;
  top.querySelector("small").textContent = game.first_release_date < Date.now() / 1000 ? `${Utilities.dateFromUnix(game.first_release_date)} (${Utilities.timeAgoFromUnix(game.first_release_date)})` : `${Utilities.dateFromUnix(game.first_release_date)}`;
  top.querySelector("p").textContent = game.summary;

  const cover = top.querySelector("img");
    if (game.cover.portrait_url) {
      cover.setAttribute("src", game.cover.portrait_url);
    } else {
      cover.remove();
    }

  const iframe = top.querySelector("iframe");
  if (game.videos?.length > 0) {
    const video = game.videos.find((v) => v.name.includes("Launch")) ?? game.videos.at(-1);
    iframe.setAttribute("src", `https://www.youtube.com/embed/${video.video_id}?mute=1`);
  } else {
    iframe.style.visibility = "hidden";
  }
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
    game.involved_companies?.length > 0 ? game.involved_companies.filter((e) => e.developer).map((e) => e.company) : [],
    "name"
  );
  createAboutList(
    "#main--about--supporting-developers",
    game.involved_companies?.length > 0 ? game.involved_companies.filter((e) => e.supporting).map((e) => e.company) : [],
    "name"
  );
  createAboutList(
    "#main--about--publishers",
    game.involved_companies?.length > 0 ? game.involved_companies.filter((e) => e.publisher).map((e) => e.company) : [],
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
     const parent = document.querySelector("#main--localization");
     if (parent.lastElementChild.tagName !== "SECTION") {
       parent.remove();
     }
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
  const page = document.querySelector("#main-content");
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

function fillReviews() {
  const section = document.querySelector("#main--reception");
  if(rating && (game.rating || rating.topCriticScore >= 0)){
    const usersRating = section.querySelector("#main--reception--users");
    usersRating.querySelector("small").textContent = `Based on ${game.rating_count} reviews`;
    usersRating.querySelector(".rating span").textContent = Math.round(game.rating);
    usersRating.querySelector(".rating").classList.add(`rating-${Math.ceil(game.rating / 20)}`);
    const criticsRating = section.querySelector("#main--reception--critics");
    criticsRating.querySelector("small").textContent = `Based on ${rating.numTopCriticReviews} reviews`;
    criticsRating.querySelector(".rating span").textContent = Math.round(rating.topCriticScore);
    criticsRating.querySelector(".rating").classList.add(`rating-${Math.ceil(rating.topCriticScore / 20)}`);

    if (reviews?.length > 0) {
      reviews.forEach((review) => {
        const template = section.querySelector("template");
        let clone = template.content.firstElementChild.cloneNode(true);
        clone.querySelector("img").setAttribute("src", `https://img.opencritic.com/${review.Outlet.imageSrc.og}`);
        clone.querySelector("b").textContent = review.Outlet.name;
        clone.querySelector("small").textContent = review.alias;
        clone.querySelector("p").textContent = review.snippet;
        clone.setAttribute("href", review.externalUrl);
        const score = clone.querySelector(".rating");
        if (review.score) {
          score.querySelector("span").textContent = review.score;
          score.classList.add(`rating-${Math.ceil(review.score / 20)}`);
        } else {
          score.remove();
        }

        template.parentElement.append(clone);
      });
    }
  } else {
    section.remove();
  }
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

      const versionName = version.name.replace(game.name, "").replace(/[:\-–]\s*/, "");
      card.querySelector("b").textContent = versionName;

      if(version.cover) {
        const cover = card.querySelector(".cover");
        cover.style.backgroundImage = `url(${version.cover.portrait_url})`;
      }

      card.setAttribute("href", `/HTML/game/?id=${version.id}`);
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

      if(expansion.cover) {
        const cover = card.querySelector(".cover");
        cover.style.backgroundImage = `url(${expansion.cover.portrait_url})`;
      }

      const date = card.querySelector(".subtexts small");
      // date.textContent = expansion.name.replace(`${game.name}: `, "").replace(`${game.name} - `, "");

      card.setAttribute("href", `/HTML/game/?id=${expansion.id}`);
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

      if(dlc.cover) {
        const cover = card.querySelector(".cover");
        cover.style.backgroundImage = `url(${dlc.cover.portrait_url})`;
      }

      const date = card.querySelector(".subtexts small");
      // date.textContent = game.name;

      card.setAttribute("href", `/HTML/game/?id=${dlc.id}`);
    }
  } else {
    section.remove();
    const parent = document.querySelector("#main--additional-content");
    if (parent.lastElementChild.tagName !== "SECTION") {
      parent.remove();
    }
  }
}

function fillTimeToBeat() {
  const section = document.querySelector("#main--time-to-beat");
  if (timeToBeat) {
    section.querySelector("#main--time-to-beat--minimum").textContent = Utilities.durationFromUnix(timeToBeat.hastily, "hours");
    section.querySelector("#main--time-to-beat--normal").textContent = Utilities.durationFromUnix(timeToBeat.normaly, "hours");
    section.querySelector("#main--time-to-beat--completionist").textContent = Utilities.durationFromUnix(timeToBeat.completely, "hours");
    section.querySelector("#main--time-to-beat--speedrun").textContent = Utilities.durationFromUnix(timeToBeat.speedrun);
  } else {
    section.remove();
  }
}

function fillPrices() {
  const section = document.querySelector("#main--prices");
  if (prices && prices.deals?.length > 0) {
    const table = section.querySelector("tbody");
    prices.deals.forEach((deal) => {
      const tr = document.createElement("tr");

      let td = document.createElement("td");
      td.textContent = deal.shop.name;
      tr.append(td);

      td = document.createElement("td");
      if (deal.drm?.length > 0) {
        deal.drm.forEach((d) => {
          if(d.name == "Drm Free") {
            td.textContent = "-"
          } else {
            let img = document.createElement("img");
            img.setAttribute("src", IGDB.getWebsiteFromUrl(d.name).icon);
            td.append(img);
          }
        });
      } else {
        let img = document.createElement("img");
        img.setAttribute("src", IGDB.getWebsiteFromUrl(deal.shop.name).icon);
        td.append(img);
      }
      
      tr.append(td);
    
      td = document.createElement("td");
      td.textContent = `${deal.regular.amount.toFixed(2)}${Utilities.getCurrencyGlyph(deal.regular.currency)}`;
      tr.append(td);

      td = document.createElement("td");
      const storeLowPercentage = (1 - (deal.storeLow.amountInt / deal.regular.amountInt)) * 100;
      const storeLowString = storeLowPercentage > 0 ? ` (-${Math.round(storeLowPercentage)}%)` : "";
      td.textContent = `${deal.storeLow.amount.toFixed(2)}${Utilities.getCurrencyGlyph(deal.storeLow.currency)}` + storeLowString;
      if (deal.storeLow.amount == deal.price.amount && deal.storeLow.amount < deal.regular.amount) {
        td.style.fontWeight = "600";
        td.style.color = "#00c851";
      }
      tr.append(td);

      td = document.createElement("td");
      const pricePercentage = (1 - deal.price.amountInt / deal.regular.amountInt) * 100;
      const pricePercentageString = pricePercentage > 0 ? ` (-${Math.round(pricePercentage)}%)` : "";
      td.textContent = `${deal.price.amount.toFixed(2)}${Utilities.getCurrencyGlyph(deal.price.currency)}` + pricePercentageString;
      if(deal.price.amount < deal.regular.amount) {
        td.style.fontWeight = "600";
        td.style.color = "#00c851";
      }
      tr.append(td);

      table.append(tr);
      
      tr.addEventListener("click", () => {
        window.open(deal.url, "_blank").focus();
      });
    });
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