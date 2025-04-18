// npx lcp --proxyUrl https://api.igdb.com/v4

"use strict";

import * as Utilities from "../utilities_module.js";

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
      body: `fields ${fields};` + (sort ? ` sort ${sort};` : "") + (limit ? ` limit ${limit};` : "") + ` where popularity_type = ${popularityType}` + (where ? ` & ${where};` : ";"),
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
      body: `fields ${fields};` + (sort ? ` sort ${sort};` : "") + (limit ? ` limit ${limit};` : "") + (where ? ` where ${where};` : ""),
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
      body: `fields ${fields};` + (sort ? ` sort ${sort};` : "") + (limit ? ` limit ${limit};` : "") + (where ? ` where ${where};` : ""),
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
      body: `fields ${fields};` + (sort ? ` sort ${sort};` : "") + (limit ? ` limit ${limit};` : "") + (where ? ` where ${where};` : ""),
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
      body: `fields ${fields};` + (sort ? ` sort ${sort};` : "") + (limit ? ` limit ${limit};` : "") + (where ? ` where ${where};` : ""),
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

export async function requestVideos(fields, sort = "", limit = "", where = "") {
  try {
    const response = await fetch("http://localhost:8010/proxy/game_videos/", {
      method: "POST",
      headers: {
        "Client-ID": localStorage.getItem("client_id"),
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        Accept: "application/json",
      },
      body: `fields ${fields};` + (sort ? ` sort ${sort};` : "") + (limit ? ` limit ${limit};` : "") + (where ? ` where ${where};` : ""),
    });

    if (response.ok) {
      const videos = await response.json();
      return videos;
    } else {
      console.error("Failed to fetch videos:", response.statusText);
      return null;
    }
  } catch (error) {
    console.error("Error fetching videos:", error);
    return null;
  }
}

export async function requestSeries(fields, sort = "", limit = "", where = "") {
  try {
    const response = await fetch("http://localhost:8010/proxy/collections/", {
      method: "POST",
      headers: {
        "Client-ID": localStorage.getItem("client_id"),
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        Accept: "application/json",
      },
      body: `fields ${fields};` + (sort ? ` sort ${sort};` : "") + (limit ? ` limit ${limit};` : "") + (where ? ` where ${where};` : ""),
    });

    if (response.ok) {
      const series = await response.json();
      return series;
    } else {
      console.error("Failed to fetch series:", response.statusText);
      return null;
    }
  } catch (error) {
    console.error("Error fetching series:", error);
    return null;
  }
}

export async function requestFranchises(fields, sort = "", limit = "", where = "") {
  try {
    const response = await fetch("http://localhost:8010/proxy/franchises/", {
      method: "POST",
      headers: {
        "Client-ID": localStorage.getItem("client_id"),
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        Accept: "application/json",
      },
      body: `fields ${fields};` + (sort ? ` sort ${sort};` : "") + (limit ? ` limit ${limit};` : "") + (where ? ` where ${where};` : ""),
    });

    if (response.ok) {
      const franchises = await response.json();
      return franchises;
    } else {
      console.error("Failed to fetch franchises:", response.statusText);
      return null;
    }
  } catch (error) {
    console.error("Error fetching franchises:", error);
    return null;
  }
}

export function getCovers(games) {
  games.forEach((game) => {
    if (game.cover != null) {
      let steamURL;
      if (game.websites?.length > 0) steamURL = game.websites.find((website) => website.url.includes("steam"));
      if (steamURL) {
        const match = steamURL.url.match(/\/app\/(\d+)/);
        game.cover = {
          landscape_url: `https://steamcdn-a.akamaihd.net/steam/apps/${match[1]}/header.jpg`,
          portrait_url: `https://steamcdn-a.akamaihd.net/steam/apps/${match[1]}/library_600x900_2x.jpg`,
          hero_url: `https://steamcdn-a.akamaihd.net/steam/apps/${match[1]}/library_hero.jpg`,
          logo_url: `https://steamcdn-a.akamaihd.net/steam/apps/${match[1]}/logo.png`,
        };
      } else {
        game.cover = {
          landscape_url: `https://images.igdb.com/igdb/image/upload/t_screenshot_big/image_id.webp`.replace("image_id", game.cover.image_id),
          portrait_url: `https://images.igdb.com/igdb/image/upload/t_cover_big/image_id.webp`.replace("image_id", game.cover.image_id),
          hero_url: `https://images.igdb.com/igdb/image/upload/t_1080p/image_id.webp`.replace("image_id", game.cover.image_id),
          logo_url: ``,
        };
      }
    }
  });

  return games;
}

export function formatLanguages(languages) {
  let newLanguages = [];

  languages.forEach((supp) => {
    let language = newLanguages.find((e) => e.language.name == supp.language.name);
    if (language == null) {
      language = {
        language: supp.language,
        audio: supp.language_support_type == "Audio",
        subtitles: supp.language_support_type == "Subtitles",
        interface: supp.language_support_type == "Interface",
      };
      newLanguages.push(language);
    }
    language.audio = supp.language_support_type.name == "Audio" || language.audio;
    language.subtitles = supp.language_support_type.name == "Subtitles" || language.subtitles;
    language.interface = supp.language_support_type.name == "Interface" || language.interface;
  });

  return newLanguages.sort((a, b) => a.language.name.localeCompare(b.language.name));
}

export function formatAgeRatings(ageRatings) {
  let newRatings = [];

  ageRatings.forEach(rating => {
    const newRating = {
      country: getCountryFromRating(rating.organization.name),
      organization: rating.organization.name,
      rating: rating.rating,
      logo_url: `/Assets/Age ratings/${rating.rating}.svg`,
      descriptions: rating.content_descriptions?.map(e => e.description)
    };
    newRatings.push(newRating);
  });

  return newRatings;
}

function getCountryFromRating(rating) {
  switch(rating) {
    case "ESRB":
      return "USA & Canada";
    case "PEGI":
      return "Europe";
    case "CERO":
      return "Japan";
    case "USK":
      return "Germany";
    case "GRAC":
      return "South Korea";
    case "CLASS_IND":
      return "Brazil";
    case "ACB":
      return "Australia";
  }
}

export function formatWebsites(websites) {
  let newWebsites = [];

  websites.forEach(wb => {
    const newWebsite = getWebsiteFromUrl(wb.url);
    newWebsites.push(newWebsite);
  });
  
  return newWebsites;
}

function getWebsiteFromUrl(url) {
  if (url.toLowerCase().includes("gog"))
    return { url: url, site: "GOG", color: "#B001DF", icon: "/Assets/Sites/gog.svg" };
  else if (url.toLowerCase().includes("twitter") || url.toLowerCase().includes("x.com")) return { url: url, site: "Twitter", color: "#000000", icon: "/Assets/Sites/twitter.svg" };
  else if (url.toLowerCase().includes("steam")) return { url: url, site: "Steam", color: "#12366A", icon: "/Assets/Sites/steam.svg" };
  else if (url.toLowerCase().includes("twitch")) return { url: url, site: "Twitch", color: "#A441F7", icon: "/Assets/Sites/twitch.svg" };
  else if (url.toLowerCase().includes("wikipedia")) return { url: url, site: "Wikipedia", color: "#E7E7E7", icon: "/Assets/Sites/wikipedia.svg" };
  else if (url.toLowerCase().includes("reddit")) return { url: url, site: "Reddit", color: "#F74300", icon: "/Assets/Sites/reddit.svg" };
  else if (url.toLowerCase().includes(".wiki") || url.toLowerCase().includes("fandom") || url.toLowerCase().includes("gamepedia")) return { url: url, site: "Wiki", color: "#F20057", icon: "/Assets/Sites/wiki.svg" };
  else if (url.toLowerCase().includes("youtube")) return { url: url, site: "YouTube", color: "#F70000", icon: "/Assets/Sites/youtube.svg" };
  else if (url.toLowerCase().includes("facebook")) return { url: url, site: "Facebook", color: "#2F8CF7", icon: "/Assets/Sites/facebook.svg" };
  else if (url.toLowerCase().includes("instagram")) return { url: url, site: "Instagram", color: "#C7507C", icon: "/Assets/Sites/instagram.svg" };
  else if (url.toLowerCase().includes("discord")) return { url: url, site: "Discord", color: "#4E63EF", icon: "/Assets/Sites/discord.svg" };
  else if (url.toLowerCase().includes("bsky")) return { url: url, site: "Bluesky", color: "#1185FE", icon: "/Assets/Sites/bluesky.svg" };
  else if (url.toLowerCase().includes("apps.apple")) return { url: url, site: "Apple App Store", color: "#1B97F0", icon: "/Assets/Sites/apple.svg" };
  else if (url.toLowerCase().includes("play.google")) return { url: url, site: "Google Play", color: "#167B36", icon: "/Assets/Sites/google.svg" };
  else if (url.toLowerCase().includes("epic")) return { url: url, site: "Epic Games Store", color: "#2B292A", icon: "/Assets/Sites/epic.svg" };
  else return { url: url, site: "", color: "#E6E6E6", icon: "/Assets/Sites/link.svg" };
}

export function formatReleases(releases) {
  let newReleases = [];

  releases.forEach(release => {
    let newRelease = newReleases.find((e) => e.date == release.date);
    if (newRelease) {
      if (newRelease.platforms.includes(release.platform.name) == false) newRelease.platforms.push(release.platform.name);
      if (newRelease.regions.includes(Utilities.capitalize(release.release_region.region)) == false) newRelease.platforms.push(Utilities.capitalize(release.release_region.region));
    } else {
      newRelease = {
        date: release.date,
        release: release.status?.name ?? "Full release",
        platforms: [release.platform.name],
        regions: [Utilities.capitalize(release.release_region.region)],
      };
      newReleases.push(newRelease);
    }
  });

  newReleases.sort((a,b) => a.date - b.date);

  return newReleases;
}