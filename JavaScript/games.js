"use strict";

import * as IGDB from "./APIs/igdb_api.js";
import * as OpenCritic from "./APIs/opencritic_api.js";
import * as PrefabModule from "./prefab_module.js";
import * as DateModule from "./date_module.js";

IGDB.default();

let game;
let reviews;
let previousGame;
let nextGame;
const frames = document.querySelectorAll(".frame");
frames.forEach((frame) => {
  frame.classList.add("hidden");
});
requestPageData();

async function requestPageData() {
  const id = new URLSearchParams(window.location.search).get("id") ?? "1";

  let games = await IGDB.requestGames("*, genres.*, websites.*, videos.*, collections.*, franchises.*, cover.*, player_perspectives.*, game_modes.*, themes.*, involved_companies.*, involved_companies.company.*, game_engines.*, platforms.*", "", 3, `id = (${parseInt(id) - 1},${id},${parseInt(id) + 1})`);
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

  console.log("Game: ", game);

  reviews = await OpenCritic.requestReviews(game.name);
  console.log("Reviews: ", reviews);

  fillPage();
}

function fillPage() {
  // Update page data
  let hero = document.querySelector("#hero");
  if (game.cover?.logo_url) {
    hero.style.backgroundImage = `url(${game.cover.hero_url})`;
    hero.querySelector(".logo").setAttribute("src", game.cover.logo_url);
  } else hero.remove();

  fillTop();
  fillGeneralData();
  fillRatings();
  fillNavigation();

  frames.forEach((frame) => {
    frame.classList.remove("hidden");
  });
}

function fillTop() {
  const top = document.querySelector("#top .frame");
  if (game.cover?.portrait_url) top.querySelector("img").setAttribute("src", game.cover.portrait_url);
  top.querySelector("h1").textContent = game.name;
  top.querySelector("small").textContent = `${DateModule.dateFromUnix(game.first_release_date)}` + (game.first_release_date < Math.floor(Date.now() / 1000) ? ` (${DateModule.timeAgoFromUnix(game.first_release_date)})` : "");
  top.querySelector("p").textContent = game.summary;

  if (game.videos?.length > 0) {
    document.querySelector("iframe").setAttribute("src", `https://www.youtube.com/embed/${game.videos.at(-1).video_id}?&mute=1`);
  }
}

function fillGeneralData() {
  const left = document.querySelector("#left");
  left.querySelector("#story-value p").textContent = game.storyline ?? "-";
  createValueLinks(game.collections, left.querySelector("#series-value-list ul"));
  createValueLinks(game.franchises, left.querySelector("#franchises-value-list ul"));
  createValueLinks(game.genres, left.querySelector("#genres-value-list ul"));
  createValueLinks(game.player_perspectives, left.querySelector("#perspectives-value-list ul"));
  createValueLinks(game.game_modes, left.querySelector("#modes-value-list ul"));
  createValueLinks(game.themes, left.querySelector("#themes-value-list ul"));
  createValueLinks(
    game.involved_companies?.filter((company) => company.developer).map((company) => company.company),
    left.querySelector("#developers-value-list ul")
  );
  createValueLinks(
    game.involved_companies?.filter((company) => company.supporting).map((company) => company.company),
    left.querySelector("#supporting-value-list ul")
  );
  createValueLinks(
    game.involved_companies?.filter((company) => company.publisher).map((company) => company.company),
    left.querySelector("#publishers-value-list ul")
  );
  createValueLinks(game.game_engines, left.querySelector("#engine-value-list ul"));
  PrefabModule.CreateAndAppendPlatforms(game.platforms, left.querySelector("#platforms-value-list ul"));
}

function createValueLinks(values, parent, key = "name") {
  if (values?.length > 0) {
    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.textContent = value[key];
      li.append(a);

      if (i < values.length - 1) {
        li.innerHTML += ",";
      }
      parent.append(li);
    }
  } else {
    const li = document.createElement("li");
    li.textContent = "-";

    parent.append(li);
  }
}

function fillRatings() {
  const ratingsUsers = document.querySelector("#ratings-users");
  if (game.total_rating) {
    ratingsUsers.querySelector(".rating-users").textContent = Math.round(game.total_rating);
    ratingsUsers.querySelector("small").textContent = `Based on ${game.total_rating_count} reviews`;
  } else ratingsUsers.remove();

  const ratingsCritics = document.querySelector("#ratings-critics");
  if (game.aggregated_rating) {
    ratingsCritics.querySelector(".rating-critics").textContent = Math.round(game.aggregated_rating);
    ratingsCritics.querySelector("small").textContent = `Based on ${game.aggregated_rating_count} reviews`;
  } else ratingsCritics.remove();

  const reviewTemplate = ratings.querySelector("template");
  for (let i = 0; i < Math.min(reviews.length, 3); i++) {
    const newClone = reviewTemplate.content.cloneNode(true);
    const review = reviews[i];

    newClone.querySelector("p").textContent = review.snippet;
    const link = newClone.querySelector("a");
    link.textContent = `- ${review.Authors[0].name}, ${review.Outlet.name}`;
    link.setAttribute("href", review.externalUrl);

    reviewTemplate.parentNode.append(newClone);
  }
}

function fillNavigation() {
  const previousGameLink = document.querySelector("#previous-game");
  if (previousGame) {
    previousGameLink.querySelector("h2").textContent = previousGame.name;
    previousGameLink.setAttribute("href", `/HTML/games/?id=${previousGame.id}`);
  } else {
    previousGameLink.remove();
  }

  const nextGameLink = document.querySelector("#next-game");
  if (nextGame) {
    nextGameLink.querySelector("h2").textContent = nextGame.name;
    nextGameLink.setAttribute("href", `/HTML/games/?id=${nextGame.id}`);
  } else {
    nextGameLink.remove();
  }
}
