"use strict";

import * as IGDB from "./igdb_api.js";
import * as DateModule from "./date_module.js";

IGDB.default();

let game;
let genres;
let websites;
let cover;
let videos;
let series;
let franchises;
const frames = document.querySelectorAll(".frame");
frames.forEach(frame => {
    frame.classList.add("hidden");
});
requestPageData();

document.title = game.name;
const originalURL = `${window.location.origin}/HTML/games/`;
history.pushState({}, "", `${originalURL}?=${game.slug}`);

async function requestPageData() {
  game = JSON.parse(sessionStorage.getItem("game"));
  console.log(game);
  genres = JSON.parse(sessionStorage.getItem("genres"));
  websites = JSON.parse(sessionStorage.getItem("websites"));
  cover = JSON.parse(sessionStorage.getItem("covers"));

  const promises = [];

  // Get videos
  if (game.videos?.length > 0) {
    const videoIDs = game.videos;
    const videosPromise = IGDB.requestVideos(
        "*",
        "",
        videoIDs.length,
        `id = (${videoIDs.toString()})`
    );
    promises.push(videosPromise);
  }

  // Get series
  if (game.collections?.length > 0) {
    const seriesIDs = game.collections;
    const seriesPromise = IGDB.requestSeries(
      "name",
      "",
      seriesIDs.length,
      `id = (${seriesIDs.toString()})`
    );
    promises.push(seriesPromise);
  }

  // Get franchises
  if (game.franchises?.length > 0) {
    const franchisesIDs = game.franchises;
    const franchisesPromise = IGDB.requestFranchises(
      "name",
      "",
      franchisesIDs.length,
      `id = (${franchisesIDs.toString()})`
    );
    promises.push(franchisesPromise);
  }

  await Promise.all(promises)
  .then((result) => {
    let index  = 0;
    videos = game.videos?.length > 0 ? result[index++] : [];
    series = game.collections?.length > 0 ? result[index++] : [];
    franchises = game.franchises?.length > 0 ? result[index++] : [];
  });

  console.log("Videos: ", videos);
  console.log("Series: ", series);
  console.log("Franchises: ", franchises);

  displayPage();
}

function displayPage() {
  // Update page data
  let hero = document.querySelector("#hero");
  if (cover.logo_url) {
    hero.style.backgroundImage = `url(${cover.hero_url})`;
    hero.querySelector(".logo").setAttribute("src", cover.logo_url);
  } else hero.remove();

  // Top frame
  const top = document.querySelector("#top .frame");
  top.querySelector("img").setAttribute("src", cover.portrait_url);
  top.querySelector("h1").textContent = game.name;
  top.querySelector("small").textContent = `${DateModule.dateFromUnix(game.first_release_date)}` + (game.first_release_date < Math.floor(Date.now() / 1000) ? ` (${DateModule.timeAgoFromUnix(game.first_release_date)})` : "");
  top.querySelector("p").textContent = game.summary;

  if (videos.length > 0) {
    document.querySelector("iframe").setAttribute("src", `https://www.youtube.com/embed/${videos.at(-1).video_id}?&mute=1`);
  }

  const left = document.querySelector("#left");
  left.querySelector("#story-value p").textContent = game.storyline ?? "-";
  createValueLinks(series, left.querySelector("#series-value-list ul"));
  createValueLinks(franchises, left.querySelector("#franchises-value-list ul"));
  createValueLinks(genres, left.querySelector("#genres-value-list ul"));

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
