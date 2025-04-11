"use strict";

import * as IGDB from "./igdb_api.js";
import * as DateModule from "./date_module.js";

IGDB.default();

let game;
let previousGame;
let nextGame;
const frames = document.querySelectorAll(".frame");
frames.forEach(frame => {
    frame.classList.add("hidden");
});
requestPageData();


async function requestPageData() {
  const id = new URLSearchParams(window.location.search).get("id");

  let games = await IGDB.requestGames(
    "*, genres.*, websites.*, videos.*, collections.*, franchises.*, cover.*, player_perspectives.*, game_modes.*, themes.*, involved_companies.*, involved_companies.company.*, game_engines.*",
    "",
    3,
    `id = (${parseInt(id)-1},${id},${parseInt(id)+1})`
  );
  games = IGDB.getCovers(games);
  for (let i = 0; i < games.length; i++) {
    if (games[i].id == id) {
      game = games[i];
    }
    else if (game == null) {
      previousGame = games[i];
    }
    else {
      nextGame = games[i];
    }
  }
  document.title = game.name;

  console.log("Game: ", game);

  displayPage();
}

function displayPage() {
  // Update page data
  let hero = document.querySelector("#hero");
  if (game.cover?.logo_url) {
    hero.style.backgroundImage = `url(${game.cover.hero_url})`;
    hero.querySelector(".logo").setAttribute("src", game.cover.logo_url);
  } else hero.remove();

  // Top frame
  const top = document.querySelector("#top .frame");
  if (game.cover?.portrait_url) top.querySelector("img").setAttribute("src", game.cover.portrait_url);
  top.querySelector("h1").textContent = game.name;
  top.querySelector("small").textContent = `${DateModule.dateFromUnix(game.first_release_date)}` + (game.first_release_date < Math.floor(Date.now() / 1000) ? ` (${DateModule.timeAgoFromUnix(game.first_release_date)})` : "");
  top.querySelector("p").textContent = game.summary;

  if (game.videos?.length > 0) {
    document.querySelector("iframe").setAttribute("src", `https://www.youtube.com/embed/${game.videos.at(-1).video_id}?&mute=1`);
  }

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

  frames.forEach((frame) => {
    frame.classList.remove("hidden");
  });
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