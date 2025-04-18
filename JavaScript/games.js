"use strict";

import * as IGDB from "./APIs/igdb_api.js";
import * as OpenCritic from "./APIs/opencritic_api.js";
import * as PrefabModule from "./prefab_module.js";
import * as Utilities from "./utilities_module.js";

IGDB.default();

let game;
let reviews;
let previousGame;
let nextGame;
/*
const frames = document.querySelectorAll(".frame");
frames.forEach((frame) => {
  frame.classList.add("hidden");
});
*/
requestPageData();

async function requestPageData() {
  const id = new URLSearchParams(window.location.search).get("id") ?? "1";

  let games = await IGDB.requestGames("*, genres.*, websites.*, videos.*, collections.*, franchises.*, cover.*, player_perspectives.*, game_modes.*, themes.*, involved_companies.*, involved_companies.company.*, game_engines.*, platforms.*, language_supports.*, language_supports.language.*, language_supports.language_support_type.*, age_ratings.*, age_ratings.content_descriptions.*, age_ratings.organization.*, release_dates.*, release_dates.platform.*, release_dates.release_region.*, release_dates.status.*", "", 3, `id = (${parseInt(id) - 1},${id},${parseInt(id) + 1})`);
  games = IGDB.getCovers(games);
  for (let i = 0; i < games.length; i++) {
    if (games[i].id == id) {
      game = games[i];
    } else if (game == null) {
      previousGame = games[i];
    } else {
      nextGame = games[i];
    }
  }

  document.title = game.name;
  if (game.language_supports?.length > 0) game.language_supports = IGDB.formatLanguages(game.language_supports);
  if (game.age_ratings?.length > 0) game.age_ratings = IGDB.formatAgeRatings(game.age_ratings);
  if (game.websites?.length > 0) game.websites = IGDB.formatWebsites(game.websites);
  if (game.release_dates?.length > 0) game.release_dates = IGDB.formatReleases(game.release_dates);
  console.log("Game: ", game);

  // reviews = await OpenCritic.requestReviews(game.name);
  // console.log("Reviews: ", reviews);

  fillPage();
}

function fillPage() {
  fillHero();
  fillAbout();

  const plot = document.querySelector("#plot");
  if (game.storyline) {
    plot.querySelector("p").textContent = game.storyline;
  } else {
    plot.remove();
  }

  fillLanguages();
  fillAgeRatings();
  fillReleases();

  createTableOfContents();
  createExternalLinks();
}

function fillHero() {
  const logo = document.querySelector("#game-logo");
  if (game.cover.logo_url) {
    document.querySelector("#game-hero").setAttribute("src", game.cover.hero_url);
    logo.querySelector("img").setAttribute("src", game.cover.logo_url);
  } else {
    logo.remove();
  }

  const hero = document.querySelector("#hero");
  hero.querySelector("h1").textContent = game.name;
  hero.querySelector("small").textContent = game.first_release_date < Date.now() / 1000 ? `${Utilities.dateFromUnix(game.first_release_date)} (${Utilities.timeAgoFromUnix(game.first_release_date)})` : `${Utilities.dateFromUnix(game.first_release_date)}`;
  hero.querySelector("p").textContent = game.summary;
  hero.querySelector("img").setAttribute("src", game.cover.portrait_url);
  const video = game.videos.find((v) => v.name.includes("Launch")) ?? game.videos.at(-1);
  hero.querySelector("iframe").setAttribute("src", `https://www.youtube.com/embed/${video.video_id}?mute=1`);
}

function fillAbout() {
  const parent = document.body.querySelector("#about .content");
  orderPlatforms();
  createAboutList(parent, "Platforms", game.platforms, "name");
  parent.append(document.createElement("hr"));
  createAboutList(parent, "Genres", game.genres, "name");
  createAboutList(parent, "Game modes", game.game_modes, "name");
  createAboutList(parent, "Player perspectives", game.player_perspectives, "name");
  createAboutList(parent, "Themes", game.themes, "name");
  parent.append(document.createElement("hr"));
  createAboutList(
    parent,
    "Main developers",
    game.involved_companies.filter((e) => e.developer).map((e) => e.company),
    "name"
  );
  createAboutList(
    parent,
    "Supporting developers",
    game.involved_companies.filter((e) => e.supporting).map((e) => e.company),
    "name"
  );
  createAboutList(
    parent,
    "Publishers",
    game.involved_companies.filter((e) => e.publisher).map((e) => e.company),
    "name"
  );
  createAboutList(parent, "Game engine", game.game_engines, "name");
  parent.append(document.createElement("hr"));
  createAboutList(parent, "Series", game.collections, "name");
  createAboutList(parent, "Franchises", game.franchises, "name");
}

function createAboutList(parent, label, array, key) {
  const container = document.createElement("div");
  container.classList.add("about-list");

  const b = document.createElement("b");
  b.textContent = label;
  container.append(b);

  const ul = document.createElement("ul");
  if (array?.length > 0) {
    for (let i = 0; i < array.length; i++) {
      const value = array[i];
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.textContent = value[key];
      li.append(a);

      if (i < array.length - 1) {
        li.innerHTML += ",";
      }
      ul.append(li);
    }
  } else {
    ul.textContent = "-";
  }
  container.append(ul);

  parent.append(container);
}

function createTableOfContents() {
  const page = document.querySelector("#page");
  const headings = page.querySelectorAll("h2, h3");
  const table = document.createElement("ul");

  headings.forEach((heading) => {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = `#${heading.parentElement.id}`;
    link.textContent = heading.textContent;

    if (heading.tagName == "H3") {
      link.style.paddingLeft = "1rem";
    }

    item.append(link);
    table.append(item);
  });

  document.querySelector("#table-of-contents").append(table);
}

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

function fillLanguages() {
  const section = document.querySelector("#languages");
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

function fillAgeRatings() {
  const parent = document.querySelector("#age div");
  if (game.age_ratings?.length > 0) {
    game.age_ratings.forEach((rating) => {
      const element = parent.querySelector(`#${rating.organization}`);
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
    document.querySelector("#age").remove();
  }
}

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

  document.querySelector("#external-links").append(grid);
}

function fillReleases() {
  const parent = document.querySelector("#releases tbody");
  game.release_dates.forEach(release => {
    const tr = document.createElement("tr");

    if(release.date == game.first_release_date && game.release_dates.length > 1) tr.classList.add("first-release-date");

    const tdDate = document.createElement("td");
    tdDate.textContent = Utilities.dateFromUnix(release.date);
    tr.append(tdDate);

    const tdRelease = document.createElement("td");
    tdRelease.textContent = release.release;
    tr.append(tdRelease);

    const tdPlatforms = document.createElement("td");
    tdPlatforms.textContent = release.platforms.join(", ");
    tr.append(tdPlatforms);

    const tdRegions = document.createElement("td");
    tdRegions.textContent = release.regions.join(", ");
    tr.append(tdRegions);

    console.log(tr)
    parent.append(tr);
  });
}