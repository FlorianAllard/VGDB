"use strict";

// Importing modules
import * as Utilities from "./utilities_module.js";
import * as IGDB from "./APIs/igdb_api.js";

const searchbar = document.querySelector("search");
const searchInput = searchbar.querySelector("input");
const searchMenu = searchbar.querySelector("menu");
const items = [];
searchInput.value = new URLSearchParams(window.location.search).get("q") ?? "";

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
    const results = await IGDB.requestGames("*, cover.*, genres.*", "", 10, "", ` search "${searchInput.value}";`);
    const games = IGDB.getCovers(results, true);

    items.forEach((item) => {
      item.remove();
    });
    
    const template = searchbar.querySelector("template");
    games.forEach((game) => {
        let clone = template.content.cloneNode(true);
        let item = clone.querySelector("li");

      item.querySelector(".cover").style.backgroundImage = `url(${game.cover.portrait_url})`;
      item.querySelector("span").textContent = game.name + (game.first_release_date ? ` (${Utilities.dateFromUnix(game.first_release_date, false, false)})` : "");

        item.querySelector("a").setAttribute("href", `/HTML/game/?id=${game.id}`);

      items.push(item);
      template.parentElement.appendChild(clone);
    });
}

function toggle(event, bool) {
    if (event == null || (bool == false && !searchbar.contains(event.relatedTarget))) {
        searchMenu.style.display = "none";
    } else if (bool) {
        searchMenu.style.display = "";
    }
}