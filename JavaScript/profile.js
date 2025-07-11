"use strict";

// Importing modules
import * as Utilities from "./utilities_module.js";
import * as IGDB from "./APIs/igdb_api.js";
import * as Requests from "./requests.js";

const CARDS_PER_LOAD = {
  favorites: 4,
  completed: 8,
  owned: 8,
  wanted: 8,
}; // Number of cards to load per page
const OFFSETS = {
  favorites: 0,
  completed: 0,
  owned: 0,
  wanted: 0,
};

// Fetch user data and favorites, then load profile card
const user = JSON.parse(localStorage.getItem("user"));

loadPage();
async function loadPage() {
  Utilities.startLoading();

  await Promise.all([
    loadCategory(1),
    loadCategory(2),
    loadCategory(3),
    loadCategory(4)
  ]);

  Utilities.stopLoading();
}

async function loadCategory(id) {
  let string;
  switch (id) {
    case 1:
      string = "favorites";
      break;
    case 2:
      string = "completed";
      break;
    case 3:
      string = "owned";
      break;
    case 4:
      string = "wanted";
      break;
  }
  const parent = document.querySelector(`#${string}`);
  const template = parent.querySelector('template');
  const response = await Requests.getCollections([
      `category_id=${id}`,
      `offset=${OFFSETS.favorites}`,
      `limit=${CARDS_PER_LOAD}`,
    ]);

  response.data.forEach(dt => {
    let clone = template.content.cloneNode(true);
    let card = clone.querySelector(".card");
    template.parentElement.appendChild(clone);

    card.querySelector('b').textContent = dt.game.name;

    card.setAttribute("href", `/HTML/game/?id=${dt.game.id}`);
  });
}

// const favoritesPromise = Requests.getCollections([
//   `category_id=1`,
//   `offset=${OFFSETS.favorites}`,
//   `limit=${CARDS_PER_LOAD}`,
// ]);
// const completedPromise = Requests.getCollections([
//   `category_id=2`,
//   `offset=${OFFSETS.completed}`,
//   `limit=${CARDS_PER_LOAD}`,
// ]);
// const ownedPromise = Requests.getCollections([
//   `category_id=3`,
//   `offset=${OFFSETS.owned}`,
//   `limit=${CARDS_PER_LOAD}`,
// ]);
// const wantedPromise = Requests.getCollections([
//   `category_id=4`,
//   `offset=${OFFSETS.wanted}`,
//   `limit=${CARDS_PER_LOAD}`,
// ]);

// const [favorites, completed, owned, wanted] = await Promise.all([
//   favoritesPromise,
//   completedPromise,
//   ownedPromise,
//   wantedPromise,
// ]);

// console.log(favorites);
// console.log(completed);
// console.log(owned);
// console.log(wanted);