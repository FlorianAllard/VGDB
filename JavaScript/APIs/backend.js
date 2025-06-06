"use strict";
import * as Utilities from "../utilities_module.js";

let userData = null;

export async function getCollectionsIncludingGame(id) {
  if (userData == null) {
    try {
      // Fetch filters data from JSON file
      const response = await fetch("/JavaScript/Data/user.json");
      if (!response.ok) {
        throw new Error(`Failed to fetch collections.json: ${response.statusText}`);
      }

      userData = await response.json();
    } catch (error) {
      console.error("Error loading filters:", error);
    }
  }

  let collectionData = userData.collection;
  const response = [];
  collectionData.forEach((coll) => {
    response.push({
      "name": coll.name,
      "includesGame": coll.games.includes(id)});
  });

  return response;
}

export async function getUser() {
  if (userData == null) {
    try {
      // Fetch filters data from JSON file
      const response = await fetch("/JavaScript/Data/user.json");
      if (!response.ok) {
        throw new Error(`Failed to fetch collections.json: ${response.statusText}`);
      }

      userData = await response.json();
    } catch (error) {
      console.error("Error loading filters:", error);
    }
  }

  return userData;
}