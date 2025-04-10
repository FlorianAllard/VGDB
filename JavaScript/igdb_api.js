// npx lcp --proxyUrl https://api.igdb.com/v4

"use strict";

const clientID = "wjrgwqzu6olj4dczprc3jx4kcvkcs4";
const clientSecret = "2lr64wndvp5g2eqogk1sym4azconhc";
const grantType = "client_credentials";
var queryParameters = `?client_id=${clientID}&client_secret=${clientSecret}&grant_type=${grantType}`;

export default function authentification() {
  const lastTokenCreation = localStorage.getItem("token_creation");
  const lastTokenDuration = localStorage.getItem("token_duration");
  if (localStorage.getItem("client_id") == null) {
    localStorage.setItem("client_id", clientID);
  }
  if (lastTokenCreation == null || Date.now() / 1000 - lastTokenCreation > lastTokenDuration) {
    console.log(`Getting new IGDB token... (expired ${Math.abs(Math.round(lastTokenDuration - (Date.now() / 1000 - lastTokenCreation)))} seconds ago)`);
    fetch("https://id.twitch.tv/oauth2/token" + queryParameters, {
      method: "POST",
    }).then((response) => {
      if (response.ok) {
        response.json().then((data) => {
          localStorage.setItem("token", data.access_token);
          localStorage.setItem("token_creation", Date.now() / 1000);
          localStorage.setItem("token_duration", data.expires_in);
        });
      }
    });
  } else {
    console.log(`IGDB token still valid (${Math.round(lastTokenDuration - (Date.now() / 1000 - lastTokenCreation))} seconds remaining)`);
  }
}

export async function requestPopularityPrimitives(fields, sort = "", limit = "", where = "", popularityType = 9) {
  try {
    const response = await fetch("http://localhost:8010/proxy/popularity_primitives/", {
      method: "POST",
      headers: {
        "Client-ID": localStorage.getItem("client_id"),
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        Accept: "application/json",
      },
      body: 
      `fields ${fields};`
      + (sort ? ` sort ${sort};` : "")
      + (limit ? ` limit ${limit};` : "")
      + ` where popularity_type = ${popularityType}`
      + (where ? ` & ${where};` : ";"),
    });

    if (response.ok) {
      const games = await response.json();
      return games.map((game) => game.game_id);
    } else {
      console.error("Failed to fetch popularity primitives:", response.statusText);
      return null;
    }
  } catch (error) {
    console.error("Error fetching popularity primitives:", error);
    return null;
  }
}

export async function requestGames(fields, sort = "", limit = "", where = "") {
  try {
    const response = await fetch("http://localhost:8010/proxy/games/", {
      method: "POST",
      headers: {
        "Client-ID": localStorage.getItem("client_id"),
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        Accept: "application/json",
      },
      body: 
      `fields ${fields};`
      + (sort ? ` sort ${sort};` : "")
      + (limit ? ` limit ${limit};` : "")
      + (where ? ` where ${where};` : ""),
    });

    if (response.ok) {
      const games = await response.json();
      return games;
    } else {
      console.error("Failed to fetch games:", response.statusText);
      return null;
    }
  } catch (error) {
    console.error("Error fetching games:", error);
    return null;
  }
}

export async function requestGenres(fields, sort = "", limit = "", where = "") {
  try {
    const response = await fetch("http://localhost:8010/proxy/genres/", {
      method: "POST",
      headers: {
        "Client-ID": localStorage.getItem("client_id"),
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        Accept: "application/json",
      },
      body: 
      `fields ${fields};`
      + (sort ? ` sort ${sort};` : "")
      + (limit ? ` limit ${limit};` : "")
      + (where ? ` where ${where};` : ""),
    });

    if (response.ok) {
      const genres = await response.json();
      return genres;
    } else {
      console.error("Failed to fetch genres:", response.statusText);
      return null;
    }
  } catch (error) {
    console.error("Error fetching genres:", error);
    return null;
  }
}

export async function requestWebsites(fields, sort = "", limit = "", where = "") {
  try {
    const response = await fetch("http://localhost:8010/proxy/websites/", {
      method: "POST",
      headers: {
        "Client-ID": localStorage.getItem("client_id"),
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        Accept: "application/json",
      },
      body:
      `fields ${fields};`
      + (sort ? ` sort ${sort};` : "")
      + (limit ? ` limit ${limit};` : "")
      + (where ? ` where ${where};` : ""),
    });

    if (response.ok) {
      const websites = await response.json();
      return websites;
    } else {
      console.error("Failed to fetch websites:", response.statusText);
      return null;
    }
  } catch (error) {
    console.error("Error fetching websites:", error);
    return null;
  }
}

export async function requestCovers(fields, sort = "", limit = "", where = "") {
  try {
    const response = await fetch("http://localhost:8010/proxy/covers/", {
      method: "POST",
      headers: {
        "Client-ID": localStorage.getItem("client_id"),
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        Accept: "application/json",
      },
      body: 
      `fields ${fields};`
      + (sort ? ` sort ${sort};` : "")
      + (limit ? ` limit ${limit};` : "")
      + (where ? ` where ${where};` : ""),
    });

    if (response.ok) {
      const games = await response.json();
      return games;
    } else {
      console.error("Failed to fetch websites:", response.statusText);
      return null;
    }
  } catch (error) {
    console.error("Error fetching websites:", error);
    return null;
  }
}