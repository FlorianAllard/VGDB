"use strict";

import * as DateModule from "./date_module.js";

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
  trendingIDs = await requestPopularityPrimitives(
    "game_id",
    "value desc",
    trendingCards.length,
    "",
    9
  );
  console.log("Trending games IDs: ", trendingIDs);

  // Get anticipated games IDs
  const today = Math.round(Date.now() / 1000);
  const maxSeconds = 100 * 86400;
  const anticipatedData = await requestGames(
    "first_release_date",
    "hypes desc", anticipatedCards.length,
    `first_release_date > ${today} & first_release_date < ${today + maxSeconds}`);
  anticipatedIDs = anticipatedData.sort((a, b) => a.first_release_date - b.first_release_date).map((data) => data.id);
  console.log("Anticipated games IDs: ", anticipatedIDs);

  // Get upcoming games IDs
  const upcomingData = await requestGames(
    "first_release_date",
    "first_release_date asc",
    upcomingCards.length,
    `first_release_date > ${today}`);
  upcomingIDs = upcomingData.map((data) => data.id);
  console.log("Upcoming games IDs: ", upcomingIDs);

  // Get all games
  const IDs = [...new Set([...trendingIDs, ...anticipatedIDs, ...upcomingIDs])];
  games = await requestGames (
    "*",
    "",
    IDs.length,
    `id = (${IDs.toString()})`
  );
  console.log("Games: ", games);

  //Get all genres
  const genreIDs = [...new Set(games.flatMap((game) => game.genres))];
  genres = await requestGenres(
    "name",
    "",
    genreIDs.length,
    `id = (${genreIDs.toString()})`
  );
  console.log("Genres: ", genres);

  //Get all websites
  const websiteIDs = [...new Set(games.flatMap((game) => game.websites).filter((id) => id))];
  websites = await requestWebsites(
    "url",
    "",
    websiteIDs.length,
    `id = (${websiteIDs.toString()})`
  );
  console.log("Websites: ", websites);

  //Get all covers
  covers = [];
  const nonSteamGames = [];
  games.forEach(game => {
    const gameWebsites = websites.filter((website) => game.websites?.includes(website.id));
    const steamURL = gameWebsites.find((website) => website.url.includes("steam"));
    if (steamURL) {
      const match = steamURL.url.match(/\/app\/(\d+)/);
      covers.push({
        game_id: game.id,
        landscape_url: `https://steamcdn-a.akamaihd.net/steam/apps/${match[1]}/header.jpg`,
        portrait_url: `https://steamcdn-a.akamaihd.net/steam/apps/${match[1]}/library_600x900_2x.jpg`,
      });
    }
    else {
      nonSteamGames.push(game);
    }
  });
  const coverIDs = [...new Set(nonSteamGames.map((game) => game.cover))];
  let nonSteamCovers;
  if(nonSteamGames.length > 0) {
    nonSteamCovers = await requestCovers(
      "image_id, url",
      "",
      coverIDs.length,
      `id = (${coverIDs.toString()})`);
    nonSteamGames.forEach(game => {
      const cover = nonSteamCovers.find((cover) => game.cover == cover.id);
      if (cover) {
        covers.push({
          game_id: game.id,
          landscape_url: `https://images.igdb.com/igdb/image/upload/t_screenshot_big/image_id.webp`.replace("image_id", cover.image_id),
          portrait_url: `https://images.igdb.com/igdb/image/upload/t_cover_big/image_id.webp`.replace("image_id", cover.image_id),
        });
      }
    });
  }
  console.log("Covers: ", covers);

  displayTrendingCards();
  displayAnticipatedCard();
  displayUpcomingCards();
}

function displayTrendingCards() {
  for (let i = 0; i < trendingCards.length; i++) {
    const card = trendingCards[i];
    const game = games.find((game) => game.id == trendingIDs[i]);
    const gameCovers = covers.find((cover) => cover.game_id == game.id);
    const gameGenres = genres.filter((genre) => game.genres.includes(genre.id));

    card.querySelector("b").textContent = game.name;

    const criticsScore = card.querySelector(".rating-critics");
    if (game.aggregated_rating) {
      criticsScore.textContent = Math.round(game.aggregated_rating);
    } else criticsScore.remove();

    const usersScore = card.querySelector(".rating-users");
    if (game.rating) {
      usersScore.textContent = Math.round(game.rating);
    } else usersScore.remove();

    const cover = card.querySelector(".cover");
    const isLandscape = cover.classList.contains("landscape");
    cover.style.backgroundImage = `url(${isLandscape ? gameCovers.landscape_url : gameCovers.portrait_url})`;

    const genresParent = card.querySelector(".subtexts");
    const genreElement = genresParent.querySelector("li");
    genreElement.querySelector("small").textContent = gameGenres[0].name;
    if (isLandscape) {
      for (let i = 1; i < gameGenres.length; i++) {
        const newElement = genreElement.cloneNode(true);
        newElement.querySelector("small").textContent = gameGenres[i].name;
        genresParent.appendChild(newElement);
      }
    }

    card.classList.remove("hidden");
  }
  const loading = trending.querySelector(".loading");
  loading.remove();
}

function displayAnticipatedCard() {
  for (let i = 0; i < anticipatedCards.length; i++) {
    const card = anticipatedCards[i];
    const game = games.find((game) => game.id == anticipatedIDs[i]);
    const gameCovers = covers.find((cover) => cover.game_id == game.id);

    card.querySelector("b").textContent = game.name;

    const cover = card.querySelector(".cover");
    cover.style.backgroundImage = `url(${gameCovers.landscape_url})`;

    const date = card.querySelector(".subtexts small");
    date.textContent = DateModule.dateFromUnix(game.first_release_date);

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
     const time = DateModule.timeRemainingFromUnix(game.first_release_date);

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
    const gameCovers = covers.find((cover) => cover.game_id == game.id);

    card.querySelector("b").textContent = game.name;

    const cover = card.querySelector(".cover");
    cover.style.backgroundImage = `url(${gameCovers.portrait_url})`;

    const date = card.querySelector(".subtexts small");
    date.textContent = DateModule.dateFromUnix(game.first_release_date);

    card.classList.remove("hidden");
  }

  const loading = upcoming.querySelector(".loading");
  loading.remove();
}