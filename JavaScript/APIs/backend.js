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
    response.push({
      "name": coll.name,
      "includesGame": coll.games.includes(id)});
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