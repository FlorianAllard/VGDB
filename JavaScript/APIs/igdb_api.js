// npx lcp --proxyUrl https://api.igdb.com/v4 --port 8010

"use strict";

import * as Utilities from "../utilities_module.js";

// Constants for IGDB API authentication
const clientID = "wjrgwqzu6olj4dczprc3jx4kcvkcs4";
const clientSecret = "2lr64wndvp5g2eqogk1sym4azconhc";
const grantType = "client_credentials";
const queryParameters = `?client_id=${clientID}&client_secret=${clientSecret}&grant_type=${grantType}`;

/**
 * Handles IGDB API authentication and token management.
 */
export default function authentification() {
  const lastTokenCreation = localStorage.getItem("token_creation");
  const lastTokenDuration = localStorage.getItem("token_duration");

  if (!localStorage.getItem("client_id")) {
    localStorage.setItem("client_id", clientID);
  }

  if (!lastTokenCreation || Date.now() / 1000 - lastTokenCreation > lastTokenDuration) {
    console.log(
      `Getting new IGDB token... (expired ${Math.abs(
        Math.round(lastTokenDuration - (Date.now() / 1000 - lastTokenCreation))
      )} seconds ago)`
    );

    fetch("https://id.twitch.tv/oauth2/token" + queryParameters, {
      method: "POST",
    })
      .then((response) => {
        if (response.ok) {
          response.json().then((data) => {
            localStorage.setItem("token", data.access_token);
            localStorage.setItem("token_creation", Date.now() / 1000);
            localStorage.setItem("token_duration", data.expires_in);
          });
        }
      })
      .catch((error) => console.error("Error during authentication:", error));
  }
}

/**
 * Generic function to make POST requests to IGDB API endpoints.
 */
async function makeRequest(endpoint, fields, sort, limit, where, additionalBody = "") {
  authentification();

  const body =
    (fields ? ` fields ${fields};` : "") +
    (sort ? ` sort ${sort};` : "") +
    (limit ? ` limit ${limit};` : "") +
    (where ? ` where ${where};` : "") +
    additionalBody;
  console.log(body);

  try {
    const response = await fetch(`http://localhost:8010/proxy/${endpoint}/`, {
      method: "POST",
      headers: {
        "Client-ID": localStorage.getItem("client_id"),
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        Accept: "application/json",
      },
      body,
    });

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

// Specific API request functions
export async function requestPopularityPrimitives(fields, sort = "", limit = "", where = "", popularityType = 9) {
  const additionalBody = ` where popularity_type = ${popularityType}` + (where ? ` & ${where};` : ";");
  const data = await makeRequest("popularity_primitives", fields, sort, limit, "", additionalBody);
  return data ? data.map((item) => item.game_id) : null;
}
export async function requestGames(fields, sort = "", limit = "", where = "", search = "") {
  return await makeRequest("games", fields, sort, limit, where, search);
}
export async function requestTotalGames(where="", search="") {
  return await makeRequest("games/count", "", "", "", where, search);
}
export async function requestGameVersions(fields, sort = "", limit = "", where = "") {
  return await makeRequest("game_versions", fields, sort, limit, where);
}
export async function requestGenres(fields, sort = "", limit = "", where = "") {
  return await makeRequest("genres", fields, sort, limit, where);
}
export async function requestWebsites(fields, sort = "", limit = "", where = "") {
  return await makeRequest("websites", fields, sort, limit, where);
}
export async function requestCovers(fields, sort = "", limit = "", where = "") {
  return await makeRequest("covers", fields, sort, limit, where);
}
export async function requestVideos(fields, sort = "", limit = "", where = "") {
  return await makeRequest("game_videos", fields, sort, limit, where);
}
export async function requestSeries(fields, sort = "", limit = "", where = "") {
  return await makeRequest("collections", fields, sort, limit, where);
}
export async function requestFranchises(fields, sort = "", limit = "", where = "") {
  return await makeRequest("franchises", fields, sort, limit, where);
}
export async function requestTimeToBeat(fields, sort = "", limit = "", where = "") {
  const result = await makeRequest("game_time_to_beats", fields, sort, limit, where);
  return result[0];
}

/**
 * Enhances game objects with cover URLs.
 */
export async function getCovers(elements, skipSteam = false) {
  if (elements == null || elements.length <= 0) return;

  // Map each element to a Promise
  const promises = elements.map(async (element) => {
    let cover = null;

    if (element.cover) {
      cover = {
        landscape_url: getImage(element.cover.image_id, "hero"),
        portrait_url: getImage(element.cover.image_id, "portrait"),
        hero_url: "",
        logo_url: "",
        fit: "contain",
      };
    }

    if (element.cover) {
      let steamURL;
      if (!skipSteam) {
        steamURL = element.websites?.find((website) => website.url.includes("steam"));
      }
      const match = steamURL ? steamURL.url.match(/\/app\/(\d+)/) : undefined;

      if (match && !skipSteam) {
        // Launch all imageExists calls concurrently for this element
        const [landscapeExists, portraitExists, heroExists, logoExists] = await Promise.all([
        Utilities.imageExists(`https://steamcdn-a.akamaihd.net/steam/apps/${match[1]}/header.jpg`), 
        Utilities.imageExists(`https://steamcdn-a.akamaihd.net/steam/apps/${match[1]}/library_600x900_2x.jpg`),
        Utilities.imageExists(`https://steamcdn-a.akamaihd.net/steam/apps/${match[1]}/library_hero.jpg`),
        Utilities.imageExists(`https://steamcdn-a.akamaihd.net/steam/apps/${match[1]}/logo.png`)]);

        // Update cover URLs based on the results
        if (landscapeExists) cover.landscape_url =
          `https://steamcdn-a.akamaihd.net/steam/apps/${match[1]}/header.jpg`;
        if (portraitExists) cover.portrait_url =
          `https://steamcdn-a.akamaihd.net/steam/apps/${match[1]}/library_600x900_2x.jpg`;
        if (heroExists) cover.hero_url =
          `https://steamcdn-a.akamaihd.net/steam/apps/${match[1]}/library_hero.jpg`;
        if (logoExists) cover.logo_url =
          `https://steamcdn-a.akamaihd.net/steam/apps/${match[1]}/logo.png`;
      }
    }

    // Assign the cover to the element
    element.cover = cover;
  });

  // Wait for all promises to resolve
  await Promise.all(promises);

  console.log(elements);
  return elements;
}

/**
 * Formats language support data.
 */
export function formatLanguages(languages) {
  const newLanguages = [];

  languages.forEach((supp) => {
    let language = newLanguages.find((e) => e.language.name === supp.language.name);
    if (!language) {
      language = {
        language: supp.language,
        audio: supp.language_support_type === "Audio",
        subtitles: supp.language_support_type === "Subtitles",
        interface: supp.language_support_type === "Interface",
      };
      newLanguages.push(language);
    }
    language.audio ||= supp.language_support_type.name === "Audio";
    language.subtitles ||= supp.language_support_type.name === "Subtitles";
    language.interface ||= supp.language_support_type.name === "Interface";
  });

  return newLanguages.sort((a, b) => a.language.name.localeCompare(b.language.name));
}

/**
 * Formats age ratings data.
 */
export function formatAgeRatings(ageRatings) {
  return ageRatings.map((rating) => ({
    country: getCountryFromRating(rating.organization.name),
    organization: rating.organization.name,
    rating: rating.rating,
    logo_url: `/Assets/Age ratings/${rating.rating}.svg`,
    descriptions: rating.content_descriptions?.map((e) => e.description),
  }));
}

function getCountryFromRating(rating) {
  const countries = {
    ESRB: "USA & Canada",
    PEGI: "Europe",
    CERO: "Japan",
    USK: "Germany",
    GRAC: "South Korea",
    CLASS_IND: "Brazil",
    ACB: "Australia",
  };
  return countries[rating] || "Unknown";
}

/**
 * Formats website data.
 */
export function formatWebsites(websites) {
  return websites.map((wb) => getWebsiteFromUrl(wb.url));
}

export function getWebsiteFromUrl(url) {
  const sites = [
    { keyword: "gog", site: "GOG", color: "#B001DF", icon: "/Assets/Sites/gog.svg" },
    { keyword: "twitter", site: "Twitter", color: "#000000", icon: "/Assets/Sites/twitter.svg" },
    { keyword: "x.com", site: "Twitter", color: "#000000", icon: "/Assets/Sites/twitter.svg" },
    { keyword: "steam", site: "Steam", color: "#12366A", icon: "/Assets/Sites/steam.svg" },
    { keyword: "twitch", site: "Twitch", color: "#A441F7", icon: "/Assets/Sites/twitch.svg" },
    { keyword: "wikipedia", site: "Wikipedia", color: "#E7E7E7", icon: "/Assets/Sites/wikipedia.svg" },
    { keyword: "reddit", site: "Reddit", color: "#F74300", icon: "/Assets/Sites/reddit.svg" },
    { keyword: "youtube", site: "YouTube", color: "#F70000", icon: "/Assets/Sites/youtube.svg" },
    { keyword: "facebook", site: "Facebook", color: "#2F8CF7", icon: "/Assets/Sites/facebook.svg" },
    { keyword: "instagram", site: "Instagram", color: "#C7507C", icon: "/Assets/Sites/instagram.svg" },
    { keyword: "discord", site: "Discord", color: "#4E63EF", icon: "/Assets/Sites/discord.svg" },
    { keyword: "apps.apple", site: "Apple App Store", color: "#1B97F0", icon: "/Assets/Sites/apple.svg" },
    { keyword: "play.google", site: "Google Play", color: "#167B36", icon: "/Assets/Sites/google.svg" },
    { keyword: "epic", site: "Epic Games Store", color: "#2B292A", icon: "/Assets/Sites/epic.svg" },
    { keyword: "bsky", site: "Epic Games Store", color: "#1081F6", icon: "/Assets/Sites/bluesky.svg" },
    { keyword: "wiki", site: "Game wiki", color: "#F20057", icon: "/Assets/Sites/wiki.svg" },
    { keyword: "microsoft", site: "Microsoft Store", color: "#F20057", icon: "/Assets/Sites/microsoft-store.svg" },
  ];

  const site = sites.find((s) => url.toLowerCase().includes(s.keyword));
  return site
    ? { url, site: site.site, color: site.color, icon: site.icon }
    : { url, site: "", color: "#E6E6E6", icon: "/Assets/Sites/link.svg" };
}

/**
 * Formats release data.
 */
export function formatReleases(releases) {
  const formattedReleases = [];

  releases.forEach((release) => {
    let existingRelease = formattedReleases.find(
      (e) => e.date === release.date && e.release === (release.status?.name || "Full Release")
    );

    if (existingRelease) {
      let platformGroup = existingRelease.platforms.find(
        (p) =>
          p.names.includes(release.platform.name) ||
          p.regions.includes(Utilities.capitalize(release.release_region.region))
      );

      if (platformGroup) {
        if (!platformGroup.names.includes(release.platform.name)) {
          platformGroup.names.push(release.platform.name);
        }
        if (!platformGroup.regions.includes(Utilities.capitalize(release.release_region.region))) {
          platformGroup.regions.push(Utilities.capitalize(release.release_region.region));
        }
      } else {
        existingRelease.platforms.push({
          names: [release.platform.name],
          regions: [Utilities.capitalize(release.release_region.region)],
        });
      }
    } else {
      formattedReleases.push({
        date: release.date,
        release: release.status?.name || "Full Release",
        platforms: [
          {
            names: [release.platform.name],
            regions: [Utilities.capitalize(release.release_region.region)],
          },
        ],
      });
    }
  });

  formattedReleases.forEach((release) => {
    release.platforms.forEach((platform) => {
      platform.names.sort((a, b) => a.localeCompare(b));
    });
    release.platforms.sort((a, b) => a.names[0].localeCompare(b.names[0]));
  });

  formattedReleases.sort((a, b) => a.date - b.date);

  return formattedReleases;
}

export function getImage(id, format) {
  switch (format) {
    case "landscape":
      return `https://images.igdb.com/igdb/image/upload/t_screenshot_big/${id}.webp`;
    case "portrait":
      return `https://images.igdb.com/igdb/image/upload/t_cover_big/${id}.webp`;
    case "hero":
      return `https://images.igdb.com/igdb/image/upload/t_1080p/${id}.webp`;

    default:
      break;
  }
}
