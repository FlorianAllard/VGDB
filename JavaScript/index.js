"use strict";

const trending = document.querySelector("#trending");
const trendingTemplate = trending.querySelector("template");
getTrendingGames(5);

/** Calls the IGDB API to get the most popular games based on IGDB visits, then instantiates a card for each
 *
 * @param {number} amount
 */
async function getTrendingGames(amount) {
  const cards = createTrendingCards(amount);

  const gamesData = await getGamesByPopularity(amount);
  // Wait until all cards are filled and ready to be displayed
  await Promise.all(
    gamesData.map((gameData, index) => {
      return setTrendingCardData(
        cards[index],
        gameData,
        index == 0 ? "landscape" : "portrait"
      );
    })
  );

  // Display all cards and remove loading animation
  cards.forEach(card => {
    card.classList.remove("hidden");
  });
  const loading = trending.querySelector(".loading");
  loading.remove();
}

function createTrendingCards(amount) {
  const cards = [];
  for (let i = 0; i < amount; i++) {
    let trendingClone = trendingTemplate.content.cloneNode(true);
    const card = trendingClone.querySelector(".card");
    trendingTemplate.parentElement.appendChild(trendingClone);
    card.classList.add("hidden");
    if(i==0){
        card.querySelector(".cover").classList.add("landscape");
    } else {
        card.querySelector(".cover").classList.add("portrait");
    }
    cards.push(card);
  }
  return cards;
}

/** Instantiates a card and fills it with a game's data
 *
 * @param {Object} gameData
 * @param {string} format
 * @returns {Element}
 */
async function setTrendingCardData(card, gameData, format) {
  card.id = gameData.id;
  card.querySelector("b").textContent = gameData.name;

  // Assign rating values
  // TODO Replace with review aggregator score (Metacritic, Opencritic...)
  const criticsScore = card.querySelector(".rating-critics");
  if (gameData.aggregated_rating) {
    criticsScore.textContent = Math.round(gameData.aggregated_rating);
  } else criticsScore.remove();

  // TODO Replace with review aggregator score (Metacritic, Opencritic...)
  const usersScore = card.querySelector(".rating-users");
  if (gameData.rating) {
    usersScore.textContent = Math.round((gameData.rating / 10) * 10) / 10;
  } else usersScore.remove();

  // Fetch genre values
  const genresParent = card.querySelector(".subtexts");
  const genreElement = genresParent.querySelector("li");
  const genres = await getGenresById(gameData.genres);

  // Fetch and assign covers
  const websites = await getWebsites(gameData.websites);
  console.log(gameData);
  let coverURL = await getGameCover(websites, format, gameData.cover);
  card.querySelector(".cover").style.backgroundImage = `url(${coverURL})`;

  // Displays cover in the right format (usually, landscape for first card then portraits)
  // If landscape: show all genres
  if (format == "landscape") {
    for (let i = 0; i < genres.length; i++) {
      const genre = genres[i].name;
      if (i == 0) {
        genreElement.querySelector("small").textContent = genre;
      } else {
        const newElement = genreElement.cloneNode(true);
        newElement.querySelector("small").textContent = genre;
        genresParent.appendChild(newElement);
      }
    }
  }
  // If portrait: show only one genre
  else {
    genreElement.querySelector("small").textContent = genres[0].name;
  }
}
