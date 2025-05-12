"use strict";

// Importing modules
import * as Utilities from "./utilities_module.js";
import * as IGDB from "./APIs/igdb_api.js";

const searchbar = document.querySelector("search");
const searchInput = searchbar.querySelector("input");
const searchMenu = searchbar.querySelector("menu");
const items = [];

searchInput.addEventListener("input", () => updateSearchDelay());
searchInput.addEventListener("focusin", (event) => toggle(event, true));
searchInput.addEventListener("focusout", (event) => toggle(event, false));
toggle(null, false);

let timeout;
function updateSearchDelay() {
  clearTimeout(timeout);
  timeout = window.setTimeout(() => {
    updateSearch();
  }, 250);
}

async function updateSearch() {
  const results = await IGDB.requestGames("*, cover.*, genres.*, websites.*", "", 10, "", ` search "${searchInput.value}";`);
  const games = await IGDB.getCovers(results);

  items.forEach((item) => {
    item.remove();
  });

  if (games?.length > 0) {
    const template = searchbar.querySelector("template");
    games.forEach((game) => {
      let clone = template.content.cloneNode(true);
      let item = clone.querySelector("li");
      if (game.cover) {
        item.querySelector(".cover").style.backgroundImage = `url(${game.cover.portrait_url})`;
      }
      item.querySelector("span").textContent = game.name + (game.first_release_date ? ` (${Utilities.dateFromUnix(game.first_release_date, false, false)})` : "");

      const platformsParent = item.querySelector(".subtexts");
      for (let i = 0; i < game.platforms.length; i++) {
        const newElement = document.createElement("li");
        const small = document.createElement("small");
        small.textContent = game.platforms[i].abbreviation;
        newElement.appendChild(small);
        platformsParent.appendChild(newElement);
      }

      item.querySelector("a").setAttribute("href", `/HTML/game/?id=${game.id}`);

      items.push(item);
      template.parentElement.appendChild(clone);
    });
  }
}

function toggle(event, bool) {
    if (event == null || (bool == false && !searchbar.contains(event.relatedTarget))) {
        searchMenu.style.display = "none";
    } else if (bool) {
        searchMenu.style.display = "";
    }
}