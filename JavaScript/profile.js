"use strict";

// Importing modules
import * as Utilities from "./utilities_module.js";
import * as IGDB from "./APIs/igdb_api.js";
import * as BackEnd from "./APIs/backend.js";

const CARDS_PER_LOAD = 12; // Number of cards to load per page
const OFFSETS = {
  finished: 0,
  owned: 0,
  wanted: 0,
};

// Fetch user data and favorites, then load profile card
const user = await BackEnd.getUser();
const favorites = await loadFavorites();
await loadProfileCard(favorites);

// Initialize collections and navigation buttons
["finished", "owned", "wanted"].forEach(collection => {
  loadCollection(collection);
  document.querySelector(`#${collection} .navigation--previous`).addEventListener("click", () => loadCollection(collection, -1));
  document.querySelector(`#${collection} .navigation--next`).addEventListener("click", () => loadCollection(collection, 1));
});

/** Loads and fills the profile card with user info and favorite games.
 * @param {Array} favorites - Array of favorite games data
 */
async function loadProfileCard(favorites) {
  const card = document.querySelector(".profile-card");
  card.querySelector(".profile-card--title h1").textContent = user.username;
  card.querySelector(".profile-card--title h3").textContent = user.title;

  // Set stats for finished, owned, and wanted collections
  ["finished", "owned", "wanted"].forEach(name => {
    card.querySelector(`.profile-card--stats--${name} h1`).textContent =
      user.collection.find(item => item.name === name)?.games.length ?? 0;
  });

  // Set favorite covers
  card.querySelectorAll(".profile-card--stats--favorites img").forEach((cover, i) => {
    cover.src = favorites[i]?.cover?.landscape_url || "";
  });

  // Set profile portrait
  const pp = card.querySelector(".profile-card--portrait");
  pp.src = user.portrait_url;

  // Set background gradient based on dominant color of portrait
  const color = await Utilities.getDominantColor(pp);
  card.style.backgroundImage = `linear-gradient(to right, ${color}, rgba(0,0,0,0)), url(${favorites[0]?.cover?.hero_url || ""})`;
}

/** Loads games for a specific collection and fills the container with cards.
 * @param {string} collectionName - Name of the collection (e.g., "finished")
 * @param {string} containerSelector - CSS selector for the container
 * @param {number} offset - Page offset for pagination
 * @param {number|null} perLoad - Number of games to load per page
 * @returns {Promise<Array>} - Array of loaded game data
 */
async function loadGames(collectionName, containerSelector, offset = 0, perLoad = null) {
  const collection = user.collection.find(item => item.name === collectionName);
  if (!collection) return [];

  const gameIDs = collection.games;
  // Determine which game IDs to load based on pagination
  const idsToLoad = perLoad !== null
    ? gameIDs.slice(offset * perLoad, offset * perLoad + perLoad)
    : gameIDs;

  const template = document.querySelector(`${containerSelector} template`);
  // Remove all siblings after template (clear previous cards)
  while (template.nextSibling) template.parentElement.removeChild(template.nextSibling);

  // Create card elements for each game
  const cards = idsToLoad.map(() => {
    const clone = template.content.cloneNode(true);
    const card = clone.querySelector(".card");
    template.parentElement.appendChild(clone);
    return card;
  });

  if (!idsToLoad.length) {
    Utilities.stopLoading();
    return [];
  }

  // Fetch game data from IGDB API
  let gamesData = await IGDB.requestGames(
    "*, genres.*, websites.*, cover.*",
    "",
    idsToLoad.length,
    `id = (${idsToLoad.toString()})`
  );
  gamesData = await IGDB.getCovers(gamesData);
  // Sort gamesData to match the order of idsToLoad
  gamesData.sort((a, b) => idsToLoad.indexOf(a.id) - idsToLoad.indexOf(b.id));

  // Fill each card with game data
  cards.forEach((card, i) => {
    const gameData = gamesData[i];
    const cover = card.querySelector(".cover");
    const isLandscape = cover.classList.contains("landscape");
    if (gameData?.cover) {
      cover.style.backgroundImage = `url(${isLandscape ? gameData.cover.landscape_url : gameData.cover.portrait_url})`;
    }
    card.querySelector("b").textContent = gameData?.name || "";

    // Handle genres
    const genresParent = card.querySelector(".subtexts");
    const genreElement = genresParent.querySelector("li");
    genresParent.innerHTML = ""; // Clear previous genres

    if (gameData?.genres?.length) {
      gameData.genres.forEach((genre, j) => {
        if (!isLandscape && j > 0) return; // Only show one genre for portrait
        const el = j === 0 ? genreElement : genreElement.cloneNode(true);
        el.querySelector("small").textContent = genre.name;
        genresParent.appendChild(el);
      });
    } else {
      genreElement.querySelector("small").textContent = "-";
      genresParent.appendChild(genreElement);
    }

    // Set card link to game details page
    card.setAttribute("href", `/HTML/game/?id=${gameData?.id || ""}`);
  });

  Utilities.stopLoading();
  return gamesData;
}

/** Loads favorite games for the user.
 * @returns {Promise<Array>} - Array of favorite games data
 */
async function loadFavorites() {
  return await loadGames("favorites", "#favorites");
}

/** Loads a collection (finished, owned, wanted) with pagination.
 * @param {string} collection - Name of the collection
 * @param {number} mod - Modifier for pagination (-1 for previous, 1 for next)
 */
async function loadCollection(collection, mod = 0) {
  if (mod !== 0) OFFSETS[collection] += mod;
  if (OFFSETS[collection] < 0) OFFSETS[collection] = 0;

  const games = user.collection.find(item => item.name === collection)?.games || [];
  const total = games.length;
  await loadGames(collection, `#${collection}`, OFFSETS[collection], CARDS_PER_LOAD);

  // Update navigation button states
  const prevBtn = document.querySelector(`#${collection} .navigation--previous`);
  const nextBtn = document.querySelector(`#${collection} .navigation--next`);
  const nav = document.querySelector(`#${collection} .navigation`);

  prevBtn.classList.toggle("disabled", OFFSETS[collection] <= 0);
  nextBtn.classList.toggle("disabled", (OFFSETS[collection] + 1) * CARDS_PER_LOAD >= total);

  // Hide navigation if not needed
  nav.style.display =
    OFFSETS[collection] <= 0 && (OFFSETS[collection] + 1) * CARDS_PER_LOAD >= total
      ? "none"
      : "";
}
