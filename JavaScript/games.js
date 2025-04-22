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

  let games = await IGDB.requestGames("*, genres.*, websites.*, videos.*, collections.*, franchises.*, cover.*, player_perspectives.*, game_modes.*, themes.*, involved_companies.*, involved_companies.company.*, game_engines.*, platforms.*, language_supports.*, language_supports.language.*, language_supports.language_support_type.*, age_ratings.*, age_ratings.content_descriptions.*, age_ratings.organization.*, release_dates.*, release_dates.platform.*, release_dates.release_region.*, release_dates.status.*, external_games.*", "", 3, `id = (${parseInt(id) - 1},${id},${parseInt(id) + 1})`);
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
  fillTop();
  fillAbout();

  const plot = document.querySelector("#main--plot");
  if (game.storyline) {
    plot.querySelector("p").innerHTML = game.storyline;
  } else {
    plot.remove();
  }

  fillLanguages();
  fillAgeRatings();
  fillReleases();

  createTableOfContents();
  createExternalLinks();
}

function fillTop() {
  const banner = document.querySelector("#banner");
  if (game.cover.logo_url) {
    banner.querySelector("#banner--background").setAttribute("src", game.cover.hero_url);
    banner.querySelector("#banner--logo").setAttribute("src", game.cover.logo_url);
  } else {
    banner.remove();
  }

  const top = document.querySelector("#main--top");
  top.querySelector("h1").textContent = game.name;
  top.querySelector("small").textContent = game.first_release_date < Date.now() / 1000 ? `${Utilities.dateFromUnix(game.first_release_date)} (${Utilities.timeAgoFromUnix(game.first_release_date)})` : `${Utilities.dateFromUnix(game.first_release_date)}`;
  top.querySelector("p").textContent = game.summary;
  top.querySelector("img").setAttribute("src", game.cover.portrait_url);
  const video = game.videos.find((v) => v.name.includes("Launch")) ?? game.videos.at(-1);
  top.querySelector("iframe").setAttribute("src", `https://www.youtube.com/embed/${video.video_id}?mute=1`);
}

function fillAbout() {
  orderPlatforms();
  createAboutList("#main--about--platforms", game.platforms, "name");
  //
  createAboutList("#main--about--genres", game.genres, "name");
  createAboutList("#main--about--game-modes", game.game_modes, "name");
  createAboutList("#main--about--player-perspectives", game.player_perspectives, "name");
  createAboutList("#main--about--themes", game.themes, "name");
  //
  createAboutList("#main--about--main-developers", game.involved_companies.filter((e) => e.developer).map((e) => e.company), "name");
  createAboutList("#main--about--supporting-developers", game.involved_companies.filter((e) => e.supporting).map((e) => e.company), "name");
  createAboutList("#main--about--publishers", game.involved_companies.filter((e) => e.publisher).map((e) => e.company), "name");
  createAboutList("#main--about--game-engines", game.game_engines, "name");
  //
  createAboutList("#main--about--series", game.collections, "name");
  createAboutList("#main--about--franchises", game.franchises, "name");
}

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

function fillReleases() {
  const parent = document.querySelector("#main--releases tbody");
  game.release_dates.forEach(release => {
    const tr = document.createElement("tr");

    if(release.date == game.first_release_date && game.release_dates.length > 1) tr.style.fontWeight = 600;

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

    console.log(tr)
    parent.append(tr);
  });
}