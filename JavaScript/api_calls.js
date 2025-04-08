// npx lcp --proxyUrl https://api.igdb.com/v4

"use strict";

const genres = [
  {
    id: 0,
    value: "Action",
  },
];

const igdbClientID = "wjrgwqzu6olj4dczprc3jx4kcvkcs4";
if (localStorage.getItem("client_id") == null) {
  localStorage.setItem("client_id", igdbClientID);
}
const igdbClientSecret = "2lr64wndvp5g2eqogk1sym4azconhc";
const igdbGrantType = "client_credentials";
var igdbQueryParameters = `?client_id=${igdbClientID}&client_secret=${igdbClientSecret}&grant_type=${igdbGrantType}`;
igdbAuthentification();
function igdbAuthentification() {
  const lastTokenCreation = localStorage.getItem("token_creation");
  const lastTokenDuration = localStorage.getItem("token_duration");
  if (
    lastTokenCreation == null ||
    Date.now() / 1000 - lastTokenCreation > lastTokenDuration
  ) {
    console.log(
      `Getting new IGDB token... (expired ${Math.abs(
        Math.round(lastTokenDuration - (Date.now() / 1000 - lastTokenCreation))
      )} seconds ago)`
    );
    fetch("https://id.twitch.tv/oauth2/token" + igdbQueryParameters, {
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
    console.log(
      `IGDB token still valid (${Math.round(
        lastTokenDuration - (Date.now() / 1000 - lastTokenCreation)
      )} seconds remaining)`
    );
  }
}

async function getGamesByPopularity(amount) {
  try {
    const response = await fetch(
      "http://localhost:8010/proxy/popularity_primitives/",
      {
        method: "POST",
        headers: {
          "Client-ID": localStorage.getItem("client_id"),
          Authorization: "Bearer " + localStorage.getItem("token"),
          Accept: "application/json",
        },
        body: `fields game_id, value, popularity_type; sort value desc; limit ${amount}; where popularity_type = 9;`, //popularity-type = Global top sellers
      }
    );

    if (response.ok) {
      const gamesData = await response.json();
      const IDs = gamesData.map((element) => element.game_id);
      const games = await getGamesById(IDs);
      return IDs.map((id) => games.find((game) => game.id == id));
    } else {
      console.error(
        "Failed to fetch games data by popularity:",
        response.statusText
      );
      return [];
    }
  } catch (error) {
    console.error("Error fetching games data by popularity::", error);
    return null;
  }
}
/** Fetches games data by their ID
 *
 * @typedef {Object}Game
 * @param {Array} IDs
 * @returns {Game[]}
 */
async function getGamesById(IDs) {
  try {
    // https://api.igdb.com/v4/games/ via proxy
    const response = await fetch("http://localhost:8010/proxy/games/", {
      method: "POST",
      headers: {
        "Client-ID": localStorage.getItem("client_id"),
        Authorization: "Bearer " + localStorage.getItem("token"),
        Accept: "application/json",
      },
      // body: `fields *;  where id = (${generateWhere(IDs)});`,
      body: `fields name, genres, aggregated_rating, rating, websites, cover; where id = (${generateWhere(IDs)});`,
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error("Failed to fetch game data by id:", response.statusText);
      return null;
    }
  } catch (error) {
    console.error("Error fetching game data by id:", error);
    return null;
  }
}

let savedGenres = [];
/** Fetches genre names by their ID by first getting known IDs then requesting the missing IDs
 *
 * @typedef {Object} Genre
 * @param {Array} IDs
 * @returns {Genre[]}
 */
async function getGenresById(IDs) {
  const foundGenres = [];
  const missingIDs = [...IDs];

  // Check saved genres for IDs that were already fetched
  for (let i = 0; i < missingIDs.length; i) {
    let e = savedGenres.find((e) => e.id == missingIDs[i]);
    if (e != null) {
      foundGenres.push(e);
      missingIDs.splice(i, 1);
    } else i++;
  }
  // If all requested IDs were saved, return saved IDs only
  if (missingIDs.length == 0) {
    return IDs.map((id) => foundGenres.find((genre) => genre.id === id));
  }

  try {
    // https://api.igdb.com/v4/genres/ via proxy
    const response = await fetch("http://localhost:8010/proxy/genres/", {
      method: "POST",
      headers: {
        "Client-ID": localStorage.getItem("client_id"),
        Authorization: "Bearer " + localStorage.getItem("token"),
        Accept: "application/json",
      },
      body: `fields name; where id = (${generateWhere(missingIDs)});`,
    });

    if (response.ok) {
      // Save all fetched genres for later requests
      const data = await response.json();
      savedGenres = savedGenres.concat(data);

      // Return an array of saved genres and fetched genres while respecting the order in which they were requested
      const allGenres = [...foundGenres, ...data];
      return IDs.map((id) => allGenres.find((genre) => genre.id === id));
    } else {
      console.error("Failed to fetch genre data by id:", response.statusText);
      return null;
    }
  } catch (error) {
    console.error("Error fetching genre data by id:", error);
    return null;
  }
}

/** Fetches websites data by their IDs
 *
 * @typedef {Object}Website
 * @param {Array} IDs
 * @returns {Website[]}
 */
async function getWebsites(IDs) {
  try {
    // https://api.igdb.com/v4/websites/ via proxy
    const response = await fetch("http://localhost:8010/proxy/websites/", {
      method: "POST",
      headers: {
        "Client-ID": localStorage.getItem("client_id"),
        Authorization: "Bearer " + localStorage.getItem("token"),
        Accept: "application/json",
      },
      body: `fields url; where id = (${generateWhere(IDs)});`,
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error(
        "Failed to fetch websites data by id:",
        response.statusText
      );
      return null;
    }
  } catch (error) {
    console.error("Error fetching websites data by id:", error);
    return null;
  }
}

async function getGameCover(websites, format, coverID) {
  if (websites != null) {
    const steam = websites.find((website) => website.url.includes("steam"));
    if (steam != null) {
      const match = steam.url.match(/\/app\/(\d+)/);
      switch (format) {
        case "landscape":
          return `https://steamcdn-a.akamaihd.net/steam/apps/${match[1]}/header.jpg`;
      
        default:
          return `https://steamcdn-a.akamaihd.net/steam/apps/${match[1]}/library_600x900_2x.jpg`;
      }
    }
  }

  try {
    // https://api.igdb.com/v4/covers/ via proxy
    const response = await fetch("http://localhost:8010/proxy/covers/", {
      method: "POST",
      headers: {
        "Client-ID": localStorage.getItem("client_id"),
        Authorization: "Bearer " + localStorage.getItem("token"),
        Accept: "application/json",
      },
      body: `fields url; where id = (${coverID});`,
    });

    if (response.ok) {
      const data = await response.json();
      return data[0].url.replace("t_thumb", "t_cover_big");
    } else {
      console.error(
        "Failed to fetch websites data by id:",
        response.statusText
      );
      return null;
    }
  } catch (error) {
    console.error("Error fetching websites data by id:", error);
    return null;
  }
}

/** Generates a string used for "where" parameters in IGDB requests
 *
 * @param {Array} IDs
 * @returns {string}
 */
function generateWhere(IDs) {
  let where = "";
  for (let i = 0; i < IDs.length; i++) {
    const id = IDs[i];
    where += `${id}`;
    if (i < IDs.length - 1) where += ",";
  }
  return where;
}

// Need to get te game's steam ID
// https://api-docs.igdb.com/#website provides steam url containing the ID
//https://steamcdn-a.akamaihd.net/steam/apps/APP_ID/library_600x900_2x.jpg - Portrait cover
//https://steamcdn-a.akamaihd.net/steam/apps/APP_ID/capsule_616x353.jpg - Landscape cover
