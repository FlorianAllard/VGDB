"use strict";

const key = "68c854c624msh8b842e5d12bfc27p1277c9jsn0695bfe37d2d";
const host = "opencritic-api.p.rapidapi.com";
const searchTolerance = .25;

export async function requestGame(name) {
  try {
    let response = await fetch(`https://opencritic-api.p.rapidapi.com/game/search?criteria=${name}`, {
      method: "GET",
      headers: {
        "x-rapidapi-host": host,
        "x-rapidapi-key": key,
      },
    });
    let result = await response.json();
    return result[0].dist < searchTolerance ? result[0] : null;
  } catch (error) {
    console.error(error);
  }
}

export async function requestReviews(name) {
  const game = await requestGame(name);
  if(game == null) return [];

  const url = `https://opencritic-api.p.rapidapi.com/reviews/game/${game.id}?skip=0&sort=popularity`;
  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-host": host,
      "x-rapidapi-key": key,
    },
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
  }
}
