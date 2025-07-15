"use strict";

// Importing modules
import * as Utilities from "./utilities_module.js";
import * as IGDB from "./APIs/igdb_api.js";
import * as Requests from "./requests.js";

const CARDS_PER_LOAD = {
  completed: 4,
  played: 8,
  backlog: 8,
  wishlist: 8,
}; // Number of cards to load per page
const OFFSETS = {
  completed: 0,
  played: 0,
  backlog: 0,
  wishlist: 0,
};

// Fetch user data and favorites, then load profile card
const userData = await Requests.getUsers(`id=${new URLSearchParams(window.location.search).get("id")}`);
const user = userData.data[0];

loadPage();
async function loadPage() {
  Utilities.startLoading();

  await Promise.all([
    loadCategory(1),
    loadCategory(2),
    loadCategory(3),
    loadCategory(4),
    loadCard()
  ]);

  Utilities.stopLoading();
}

async function loadCategory(categoryID) {
  let string;
  switch (categoryID) {
    case 1:
      string = "completed";
      break;
    case 2:
      string = "played";
      break;
    case 3:
      string = "backlog";
      break;
    case 4:
      string = "wishlist";
      break;
  }
  const parent = document.querySelector(`#${string}`);
  const template = parent.querySelector('template');
  const response = await Requests.getCollections([
      `user_id=${user.id}`,
      `category_id=${categoryID}`,
      `offset=${OFFSETS.favorites}`,
      `limit=${CARDS_PER_LOAD}`,
    ]);

  response.data.forEach(dt => {
    let clone = template.content.cloneNode(true);
    let card = clone.querySelector(".card");
    template.parentElement.appendChild(clone);

    card.querySelector('b').textContent = dt.game.name;

    const cover = card.querySelector(".cover");
    if (dt.game.covers) {
      cover.style.backgroundImage = `url(${dt.game.covers.landscape})`;
    }

    const genresParent = card.querySelector(".subtexts");
    for (let i = 0; i < dt.game.genres?.length; i++) {
      const newElement = document.createElement('li');
      const text = document.createElement("small");
      text.textContent = dt.game.genres[i].name;
      newElement.appendChild(text);
      genresParent.appendChild(newElement);
      if (!cover.classList.contains("landscape")) break;
    }

    card.setAttribute("href", `/HTML/game/?id=${dt.game.id}`);
  });
}

async function loadCard() {
  const parent = document.querySelector(".profile-card");
  parent.querySelector(".profile-card--stats--completed h1").textContent = user.collection.completed;
  parent.querySelector(".profile-card--stats--played h1").textContent = user.collection.played;
  parent.querySelector(".profile-card--stats--backlog h1").textContent = user.collection.backlog;
  parent.querySelector(".profile-card--stats--wishlist h1").textContent = user.collection.wishlist;

  parent.querySelector(".profile-card--portrait").src = user.profilePicturePath;

  parent.querySelector(".profile-card--title h1").textContent = user.username;
  parent.querySelector(".profile-card--title h3").textContent = user.title.name;

  const dominantColor = await Utilities.getDominantColor(parent.querySelector(".profile-card--portrait"));
  parent.style.backgroundImage = user.collection.favorites?.length ? `linear-gradient(to right, ${dominantColor}, rgba(0,0,0,0)), url(${user.collection.favorites[0]?.covers?.hero || ""})` : "";

  const favoriteImages = parent.querySelectorAll(".profile-card--stats--favorites img");
  for (let i = 0; i < Math.min(user.collection.favorites?.length, favoriteImages.length); i++) {
    const favorite = user.collection.favorites[i];
    const image = favoriteImages[i];
    image.src = favorite.covers?.landscape;
  }
}