// npx lcp --proxyUrl https://api.isthereanydeal.com --port 8011

"use strict";

import * as Utilities from "../utilities_module.js";

// Constants for IGDB API authentication
const clientID = "a4d60f98f4be84c7";
const clientSecret = "690025f47e83922c7b85a64cd7b53690ef03eca0";
const key = "f598b0f0f848dead5872a11ae841cf0258cc6cdd";
const shops = [4, 52, 16, 6, 20, 35, 36, 37, 48, 61, 62];

async function makeKeyRequest(method = "GET", endpoint, params, body = "") {
  try {
    const options = {
      method: method,
    };
    if (body !== "") {
      options.body = body;
    }
    const response = await fetch(`http://localhost:8011/proxy/${endpoint}?key=${key}&${params}`, options);

    if (response.ok) {
      return await response.json();
    } else {
      console.error(`Failed to fetch ${endpoint}:`, response.statusText);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return null;
  }
}

export async function requestGame(slug) {
  const games = await makeKeyRequest("GET", "games/search/v1", `title=${slug}&results=1`);
  return games[0].slug == slug ? games[0] : null;
}

export async function requestPrices(id) {
  return await makeKeyRequest(
    "POST",
    "games/prices/v3",`
        country=FR&
        deals=false&
        vouchers=false&
        capacity=0&
        shops=${shops.join(",")}`,
    `["${id}"]`
  );
}
