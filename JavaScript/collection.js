"use strict";

// Importing modules
import * as Utilities from "./utilities_module.js";
import * as IGDB from "./APIs/igdb_api.js";
import * as BackEnd from "./APIs/backend.js";

let collection;
let games;

requestPageData();

async function requestPageData() {
    Utilities.startLoading();

    collection = await BackEnd.getCollection();
    const ids = [];
    collection.forEach(coll => {
        coll.games.forEach(id => {
            if(ids.includes(id) == false) {
                ids.push(id);
            }
        });
    });

    games = await IGDB.requestGames("*, genres.*, websites.*, cover.*", "", ids.length, `id = (${ids.toString()})`);
    games = await IGDB.getCovers(games);
    console.log(games);

    generateCards("favorites");

    Utilities.stopLoading();
}

function generateCards(collectionName) {
    const ids = collection.find((c) => c.name === collectionName).games;
    const foundGames = games.filter((game) => ids.includes(game.id));
    console.log(favorites);

    const section = document.querySelector(`#${collectionName} .content`);
    const template = section.querySelector("template");
    for (let i = 0; i < foundGames.length; i++) {
      const game = foundGames[i];
      let clone = template.content.cloneNode(true);
      let card = clone.querySelector(".card");
      template.parentElement.appendChild(clone);

      card.querySelector("b").textContent = game.name;

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

      card.setAttribute("href", `/HTML/game/?id=${game.id}`);
    }
}
