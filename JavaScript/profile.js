"use strict";

// Importing modules
import * as Utilities from "./utilities_module.js";
import * as IGDB from "./APIs/igdb_api.js";
import * as Requests from "./requests.js";

let profileEditor;
let pictureSelector;
let pictureIndex = -1;
let favoriteSelectors;

const CARDS_PER_LOAD = {
  completed: 6,
  played: 6,
  backlog: 6,
  wishlist: 6,
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

if (localStorage.getItem("logged_in") && user.id == JSON.parse(localStorage.getItem("user")).id) {
  const button = document.querySelector("#profile_card-edit");
  button.style.display = "";

  button.addEventListener("click", () => {
    enableProfileEditor();
  });
}

loadPage();
async function loadPage() {
  Utilities.startLoading();

  await Promise.all([
    loadCategory(1),
    loadCategory(2),
    loadCategory(3),
    loadCategory(4),
    loadCard(),
    initProfileEditor(),
    initPictureSelector(),
    initFavoritesSelector(),
  ]);

  initNavigation();

  Utilities.stopLoading();
}

async function loadCategory(categoryID, mod = 0) {
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

  OFFSETS[string] = Utilities.clamp(
    OFFSETS[string] + mod,
    0,
    Math.ceil(user.collection[string] / CARDS_PER_LOAD[string]) - 1
  );

  const parent = document.querySelector(`#${string}`);

  Utilities.startLoading(parent);

  const template = parent.querySelector('template');
  while (template.nextSibling) template.parentElement.removeChild(template.nextSibling);

  const response = await Requests.getCollections([
      `user_id=${user.id}`,
      `category_id=${categoryID}`,
      `offset=${OFFSETS[string] * CARDS_PER_LOAD[string]}`,
      `limit=${CARDS_PER_LOAD[string]}`,
    ]);

  response.data?.forEach(dt => {
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

  const prevBtn = document.querySelector(`#${string} .navigation--previous`);
  if (OFFSETS[string] <= 0) {
    prevBtn.setAttribute("disabled", true);
  } else {
    prevBtn.removeAttribute("disabled");
  }

  const nextBtn = document.querySelector(`#${string} .navigation--next`);
  if (OFFSETS[string] >= Math.ceil(user.collection[string] / CARDS_PER_LOAD[string]) - 1) {
    nextBtn.setAttribute("disabled", true);
  } else {
    nextBtn.removeAttribute("disabled");
  }

  Utilities.stopLoading(parent);
}

async function loadCard() {
  const parent = document.querySelector("#profile_card");
  
  const img = parent.querySelector("#profile_card-picture");
  img.src = user.picture.path;
  parent.querySelector("#profile_card-banner").style.backgroundColor = await Utilities.getDominantColor(img);
  
  parent.querySelector("#profile_card-identity-username").textContent = user.username;
  parent.querySelector("#profile_card-identity-title").textContent = user.title.name;
  
  parent.querySelector("#profile_card-stats-completed b").textContent = user.collection.completed;
  parent.querySelector("#profile_card-stats-played b").textContent = user.collection.played;
  parent.querySelector("#profile_card-stats-backlog b").textContent = user.collection.backlog;
  parent.querySelector("#profile_card-stats-wishlist b").textContent = user.collection.wishlist;

  const imgParent = parent.querySelector("#profile_card-favorites");
  for (let i = 0; i < Math.min(user.collection.favorites?.length, 3); i++) {
    const favorite = user.collection.favorites[i];
    const image = document.createElement('img');
    image.src = favorite.covers?.portrait;
    imgParent.appendChild(image);
  }
}

function initNavigation() {
  const categories = ["completed", "played", "backlog", "wishlist"];
  for (let i = 0; i < categories.length; i++) {
    const parent = document.querySelector(`#${categories[i]} .navigation`);
    const prev = parent.querySelector(".navigation--previous");
    const next = parent.querySelector(".navigation--next");
    
    prev.addEventListener("click", () => {
      loadCategory(i+1, -1);
    });
    next.addEventListener("click", () => {
      loadCategory(i+1, +1);
    });
  }
}

//#region PROFILE EDITOR

async function initProfileEditor() {
  profileEditor = document.querySelector("#profile_editor");
  profileEditor.querySelector("#profile_editor-header-close").addEventListener("click", () => {
    disableProfileEditor(null, true);
  });
  const form = profileEditor.querySelector("form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    saveProfileChanges(form);
  });

  pictureIndex = user.picture.id;

  // Title select
  let titlesAvailable = await Requests.getUserTitles();
  const titleSelect = profileEditor.querySelector("#profile_editor-general-title");
  titlesAvailable.data.forEach(titleData => {
    const option = document.createElement('option');
    option.setAttribute("value", titleData.id);
    option.textContent = titleData.name;
    titleSelect.append(option);
  });
}

async function enableProfileEditor() {
  document.body.classList.add("stop-scrolling");
  profileEditor.addEventListener("click", disableProfileEditor);
  profileEditor.setAttribute("open", "");

  profileEditor.querySelector("#profile_editor-general-username").value = user.username;

  const titleSelect = profileEditor.querySelector("#profile_editor-general-title");
  titleSelect.value = user.title.id;
}

function disableProfileEditor(event, skipEvent = false) {
  if (!skipEvent && event.target != profileEditor) return;
  profileEditor.removeAttribute("open");
  disablePictureSelector();
  document.body.classList.remove("stop-scrolling");
  profileEditor.removeEventListener("click", disableProfileEditor);
}

//#endregion

//#region PICTURE SELECTOR

async function initPictureSelector() {
  let picturesAvailable = await Requests.getProfilePictures();
  profileEditor.querySelector("#profile_editor-form-picture img").src = picturesAvailable.data.find(pic => pic.id === pictureIndex)?.path || "";
  pictureSelector = profileEditor.querySelector("#profile_editor-form-picture-selector");

  picturesAvailable.data.forEach(pic => {
    const button = document.createElement("button");
    button.style.backgroundImage = `url(${pic.path})`;
    button.setAttribute('type', 'button');

    button.addEventListener("click", () => {
      pictureIndex = pic.id;
      profileEditor.querySelector("#profile_editor-form-picture img").src = pic.path;
      disablePictureSelector();
    });

    pictureSelector.append(button);
  }); 

  profileEditor.querySelector("#profile_editor-form-picture-button").addEventListener("click", () => enablePictureSelector());
}
async function enablePictureSelector() {
  pictureSelector.style.display = "";
}
function disablePictureSelector(event, skipEvent = false) {
  pictureSelector.style.display = "none";
}

//#endregion

//#region FAVORITES SELECTOR

async function initFavoritesSelector() {
  const parent = profileEditor.querySelector("#profile_editor-favorites-container");
  const response = await Requests.getCollections([
    `user_id=${user.id}`,
    `category_id=1,2`
  ]);

  favoriteSelectors = [];
  response.data.forEach(dt => {
    const game = dt.game;
    const card = document.createElement("input");
    card.setAttribute("type", "checkbox");
    card.id = game.id;
    card.style.display = "none";
    card.checked = user.collection.favorites?.some(fav => fav.id === game.id);
    
    const label = document.createElement("label");
    label.setAttribute("for", game.id);
    label.style.backgroundImage = `url(${game.covers?.portrait})`;

    card.addEventListener("change", () => {
      updateCards();
    });

    favoriteSelectors.push(card);
    parent.appendChild(card);
    parent.appendChild(label);
  });

  updateCards();
  function updateCards() {
    const checkedCount = favoriteSelectors.filter((c) => c.checked).length;
    favoriteSelectors.forEach((card) => {
      if (!card.checked) {
        card.disabled = checkedCount >= 3;
      }
    });
  }
}

//#endregion

async function saveProfileChanges(form) {
  const userForm = new FormData(form);
  userForm.append("id", user.id);
  userForm.append("picture_id", pictureIndex);
  const userUpdate = await Requests.updateUsers(userForm);

  const favoriteForm = new FormData();
  favoriteForm.append("user_id", user.id);
  const favoriteIds = favoriteSelectors.filter(card => card.checked).map(card => card.id);
  favoriteForm.append("game_id", favoriteIds);
  const favoriteUpdate = await Requests.updateFavorites(favoriteForm);

  if (userUpdate.status == 200 && favoriteUpdate.status == 200) {
    location.reload();
  }
}