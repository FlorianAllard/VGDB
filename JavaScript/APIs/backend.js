"use strict";
import * as Utilities from "../utilities_module.js";

let collectionData = null;

export async function getCollectionsIncludingGame(id) {
  if (collectionData == null) {
    try {
      // Fetch filters data from JSON file
      const response = await fetch("/JavaScript/Data/collection.json");
      if (!response.ok) {
        throw new Error(`Failed to fetch collections.json: ${response.statusText}`);
      }

      collectionData = await response.json();
    } catch (error) {
      console.error("Error loading filters:", error);
    }
  }

  const response = [];
  collectionData.forEach((coll) => {
    if (coll.games.includes(id)) {
      response.push(coll.name);
    }
  });

  return response;
}

export async function getCollection() {
  if (collectionData == null) {
    try {
      // Fetch filters data from JSON file
      const response = await fetch("/JavaScript/Data/collection.json");
      if (!response.ok) {
        throw new Error(`Failed to fetch collections.json: ${response.statusText}`);
      }

      collectionData = await response.json();
    } catch (error) {
      console.error("Error loading filters:", error);
    }
  }

  return collectionData;
}