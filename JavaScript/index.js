"use strict";

import * as IGDB from "./APIs/igdb_api.js";
import * as Utilities from "./utilities_module.js";

IGDB.default();

const trending = document.querySelector("#trending");
const trendingTemplate = trending.querySelector("template");
const trendingCards = createTrendingCards(5);

const anticipated = document.querySelector("#most-anticipated");
const anticipatedTemplate = anticipated.querySelector("template");
const anticipatedCards = createAnticipatedCards(5);

const upcoming = document.querySelector("#coming-soon");
const upcomingTemplate = upcoming.querySelector("template");
const upcomingCards = createUpcomingCards(7);

let trendingIDs;
let anticipatedIDs;
let upcomingIDs;
let games;
let genres;
let websites;
let covers;
requestPageData();


function createTrendingCards(amount) {
  const cards = [];
  for (let i = 0; i < amount; i++) {
    let clone = trendingTemplate.content.cloneNode(true);
    let card = clone.querySelector(".card");
    trendingTemplate.parentElement.appendChild(clone);

    card.classList.add("hidden");
    if (i == 0) {
      card.querySelector(".cover").classList.add("landscape");
    } else {
      card.querySelector(".cover").classList.add("portrait");
    }
    cards.push(card);
  }
  return cards;
}

function createAnticipatedCards(amount) {
  const cards = [];
  for (let i = 0; i < amount; i++) {
    let clone = anticipatedTemplate.content.cloneNode(true);
    let card = clone.querySelector(".card");
    anticipatedTemplate.parentElement.appendChild(clone);

    card.classList.add("hidden");
    cards.push(card);
  }
  return cards;
}

function createUpcomingCards(amount) {
  const cards = [];
  for (let i = 0; i < amount; i++) {
    let clone = upcomingTemplate.content.cloneNode(true);
    let card = clone.querySelector(".card");
    upcomingTemplate.parentElement.appendChild(clone);

    card.classList.add("hidden");
    cards.push(card);
  }
  return cards;
}

async function requestPageData() {
  // Get popular games IDs
  const trendingIDsPromise = IGDB.requestPopularityPrimitives(
    "game_id",
    "value desc",
    trendingCards.length,
    "",
    9
  );

  // Get anticipated games IDs
  const today = Math.round(Date.now() / 1000);
  const maxSeconds = 100 * 86400;
  const anticipatedDataPromise = IGDB.requestGames(
    "first_release_date",
    "hypes desc", anticipatedCards.length,
    `first_release_date > ${today} & first_release_date < ${today + maxSeconds}`
  );

  // Get upcoming games IDs
  const upcomingDataPromise = IGDB.requestGames(
    "first_release_date",
    "first_release_date asc",
    upcomingCards.length,
    `first_release_date > ${today}`
  );

  // Wait for results and process
  await Promise.all([trendingIDsPromise, anticipatedDataPromise, upcomingDataPromise])
  .then((result) => {
    let index = 0;
    trendingIDs = result[index++];
    anticipatedIDs = result[index++].sort((a, b) => a.first_release_date - b.first_release_date).map((data) => data.id);
    upcomingIDs = result[index++].map((data) => data.id);
  });

  console.log("Trending games IDs: ", trendingIDs);
  console.log("Anticipated games IDs: ", anticipatedIDs);
  console.log("Upcoming games IDs: ", upcomingIDs);

  // Get all games
  const IDs = [...new Set([...trendingIDs, ...anticipatedIDs, ...upcomingIDs])];
  games = await IGDB.requestGames (
    "*, genres.*, websites.*, cover.*",
    "",
    IDs.length,
    `id = (${IDs.toString()})`
  );
  console.log("Games: ", games);

  //Get all covers
  games = IGDB.getCovers(games);

  displayTrendingCards();
  displayAnticipatedCard();
  displayUpcomingCards();
}

function displayTrendingCards() {
  for (let i = 0; i < trendingCards.length; i++) {
    const card = trendingCards[i];
    const game = games.find((game) => game.id == trendingIDs[i]);

    card.querySelector("b").textContent = game.name;

    const criticsScore = card.querySelector(".rating-critics");
    if (criticsScore && game.aggregated_rating) {
      criticsScore.textContent = Math.round(game.aggregated_rating);
    } else if (criticsScore) criticsScore.remove();

    const usersScore = card.querySelector(".rating-users");
    if (usersScore && game.rating) {
      usersScore.textContent = Math.round(game.rating);
    } else if (usersScore) usersScore.remove();

    const cover = card.querySelector(".cover");
    const isLandscape = cover.classList.contains("landscape");
    cover.style.backgroundImage = `url(${isLandscape ? game.cover.landscape_url : game.cover.portrait_url})`;

    const genresParent = card.querySelector(".subtexts");
    const genreElement = genresParent.querySelector("li");
    genreElement.querySelector("small").textContent = game.genres[0].name;
    if (isLandscape) {
      for (let i = 1; i < game.genres.length; i++) {
        const newElement = genreElement.cloneNode(true);
        newElement.querySelector("small").textContent = game.genres[i].name;
        genresParent.appendChild(newElement);
      }
    }

    card.setAttribute("href", `/HTML/games/?id=${game.id}`);

    card.classList.remove("hidden");
  }
  const loading = trending.querySelector(".loading");
  loading.remove();
}

function displayAnticipatedCard() {
  for (let i = 0; i < anticipatedCards.length; i++) {
    const card = anticipatedCards[i];
    const game = games.find((game) => game.id == anticipatedIDs[i]);

    card.querySelector("b").textContent = game.name;

    const cover = card.querySelector(".cover");
    cover.style.backgroundImage = `url(${game.cover.landscape_url})`;

    const date = card.querySelector(".subtexts small");
    date.textContent = Utilities.dateFromUnix(game.first_release_date);

    card.setAttribute("href", `/HTML/games/?id=${game.id}`);

    card.classList.remove("hidden");
  }

  updateAnticipatedCountdowns();
  const delay = (60 - new Date().getSeconds()) * 1000;
  setTimeout(() => {
    updateAnticipatedCountdowns();
    setInterval(updateAnticipatedCountdowns, 60 * 1000);
  }, delay);

  const loading = anticipated.querySelector(".loading");
  loading.remove();
}

function updateAnticipatedCountdowns() {
   for (let i = 0; i < anticipatedCards.length; i++) {
     const countdown = anticipatedCards[i].querySelector(".countdown");
     const game = games.find((game) => game.id == anticipatedIDs[i]);
     const time = Utilities.timeRemainingFromUnix(game.first_release_date);

     countdown.querySelector(".countdown-days-10s").textContent = time[0].charAt(0);
     countdown.querySelector(".countdown-days-1s").textContent = time[0].charAt(1);
     countdown.querySelector(".countdown-hours-10s").textContent = time[1].charAt(0);
     countdown.querySelector(".countdown-hours-1s").textContent = time[1].charAt(1);
     countdown.querySelector(".countdown-minutes-10s").textContent = time[2].charAt(0);
     countdown.querySelector(".countdown-minutes-1s").textContent = time[2].charAt(1);
   }
}

function displayUpcomingCards() {
  for (let i = 0; i < upcomingCards.length; i++) {
    const card = upcomingCards[i];
    const game = games.find((game) => game.id == upcomingIDs[i]);

    card.querySelector("b").textContent = game.name;

    if (game.cover) {
        const cover = card.querySelector(".cover");
        cover.style.backgroundImage = `url(${game.cover.portrait_url})`;
    }

    const date = card.querySelector(".subtexts small");
    date.textContent = Utilities.dateFromUnix(game.first_release_date);

    card.setAttribute("href", `/HTML/games/?id=${game.id}`);
    
    card.classList.remove("hidden");
  }

  const loading = upcoming.querySelector(".loading");
  loading.remove();
}