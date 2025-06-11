"use strict";

// Importing modules
import * as Utilities from "./utilities_module.js";
import * as IGDB from "./APIs/igdb_api.js";
import * as OpenCritic from "./APIs/opencritic_api.js";
import * as Speedrun from "./APIs/speedrun_api.js";
import * as IsThereAnyDeal from "./APIs/isthereanydeal_api.js";

let games = await IGDB.requestGames("*, genres.*, websites.*, videos.*, collections.*, franchises.*, cover.*, player_perspectives.*, game_modes.*, themes.*, involved_companies.*, involved_companies.company.*, game_engines.*, platforms.*, language_supports.*, language_supports.language.*, language_supports.language_support_type.*, age_ratings.*, age_ratings.content_descriptions.*, age_ratings.organization.*, release_dates.*, release_dates.platform.*, release_dates.release_region.*, release_dates.status.*, external_games.*, dlcs.*, dlcs.cover.*, expansions.*, expansions.cover.*, artworks.*, screenshots.*", "hypes desc", 100);
games = await IGDB.getCovers(games);
console.log(games);

let formattedGames = [];
games.forEach((game) => {
    formattedGames.push(formatGame(game));
});
console.log(formattedGames);
downloadJSON(formattedGames);


function formatGame(game) {
  let formattedGame = {};

  // General data
  formattedGame.id = game.id;
  formattedGame.name = game.name;
  formattedGame.official_release_date = game.first_release_date;
  formattedGame.summary = game.summary;
  formattedGame.premise = game.storyline;

  // Genres
  formattedGame.genres = [];
  game.genres?.forEach((e) => {
    let f = {};
    f.id = e.id;
    f.name = e.name;
    formattedGame.genres.push(f);
  });

  // Platforms
  formattedGame.platforms = [];
  game.platforms?.forEach((e) => {
    let f = {};
    f.id = e.id;
    f.name = e.name;
    f.family = e.platform_family?.name ?? "";
    f.generation = e.generation;
    formattedGame.platforms.push(f);
  });
  formattedGame.platforms.sort((a, b) => {
    if (a.family < b.family) return -1;
    if (a.family > b.family) return 1;
    // If family is the same, sort by generation
    return (a.generation || 0) - (b.generation || 0);
  });

  // Game modes
  formattedGame.modes = [];
  game.game_modes?.forEach((e) => {
    let f = {};
    f.id = e.id;
    f.name = e.name;
    formattedGame.modes.push(f);
  });

  // Game perspectives
  formattedGame.perspectives = [];
  game.player_perspectives?.forEach((e) => {
    let f = {};
    f.id = e.id;
    f.name = e.name;
    formattedGame.perspectives.push(f);
  });

  // Themes
  formattedGame.themes = [];
  game.themes?.forEach((e) => {
    let f = {};
    f.id = e.id;
    f.name = e.name;
    formattedGame.themes.push(f);
  });

  // Companies
  formattedGame.involved_companies = {
    main_developers: [],
    supporting_developers: [],
    publishers: [],
  };
  game.involved_companies?.forEach((e) => {
    let f = {};
    f.id = e.id;
    f.name = e.company.name;
    if (e.developer) formattedGame.involved_companies.main_developers.push(f);
    else if (e.supporting) formattedGame.involved_companies.supporting_developers.push(f);
    else if (e.publisher) formattedGame.involved_companies.publishers.push(f);
  });

  // Engine
  formattedGame.engines = [];
  game.game_engines?.forEach((e) => {
    let f = {};
    f.id = e.id;
    f.name = e.name;
    formattedGame.engines.push(f);
  });

  // Series
  formattedGame.series = [];
  game.collections?.forEach((e) => {
    let f = {};
    f.id = e.id;
    f.name = e.name;
    formattedGame.series.push(f);
  });

  // Franchises
  formattedGame.franchises = [];
  game.franchises?.forEach((e) => {
    let f = {};
    f.id = e.id;
    f.name = e.name;
    formattedGame.franchises.push(f);
  });

  //Supported languages
  formattedGame.supported_languages = {
    audio: [],
    subtitles: [],
    interface: [],
  };
  game.language_supports?.forEach((e) => {
    let f = {};
    f.id = e.language.id;
    f.name = e.language.name;
    if (e.language_support_type.name == "Audio") formattedGame.supported_languages.audio.push(f);
    if (e.language_support_type.name == "Subtitles") formattedGame.supported_languages.subtitles.push(f);
    if (e.language_support_type.name == "Interface") formattedGame.supported_languages.interface.push(f);
  });

  //Age ratings
  formattedGame.age_ratings = [];
  game.age_ratings?.forEach((e) => {
    let f = {};
    f.id = e.id;
    f.rating = e.rating;
    f.organization = { id:e.organization.id, name: e.organization.name, country: "" };
    const countries = {
      ESRB: "USA & Canada",
      PEGI: "Europe",
      CERO: "Japan",
      USK: "Germany",
      GRAC: "South Korea",
      CLASS_IND: "Brazil",
      ACB: "Australia",
    };
    f.organization.country = countries[f.organization.name] || "Unknown";
    f.contents = [];
    e.content_descriptions?.forEach((e2) => {
      f.contents.push({id: e2.id, description: e2.description});
    });
    formattedGame.age_ratings.push(f);
  });

  //Releases
  formattedGame.regional_releases = [];
  game.release_dates?.forEach((e) => {
    let rls = e.status?.name || "Full Release";
    let f = formattedGame.regional_releases.find((r) => r.date === e.date && r.release === rls) ?? { date: e.date, release: rls, regions: [], platforms: [] };
    if (f.regions.includes(e.release_region.region) == false) {
      f.regions.push(e.release_region.region);
    }
    if (f.platforms.includes(e.platform.name) == false) {
      f.platforms.push(e.platform.name);
    }

    // Only push if 'f' was just created in this loop
    if (formattedGame.regional_releases.includes(f) == false) {
      formattedGame.regional_releases.push(f);
    }
  });
  formattedGame.regional_releases.sort((a, b) => a.date - b.date);

  //Media
  formattedGame.media = {
    artworks: [],
    screenshots: [],
    videos: []
  };
  game.artworks?.forEach(e => formattedGame.media.artworks.push(e.url));
  game.screenshots?.forEach((e) => formattedGame.media.screenshots.push(e.url));
  game.videos?.forEach(e => formattedGame.media.videos.push(`https://www.youtube.com/embed/${e.video_id}`));

  //Cover
  formattedGame.covers = {
    portrait: game.cover.portrait_url,
    landscape: game.cover.landscape_url,
    hero: game.cover.hero_url,
    logo: game.cover.logo_url,
  };

  return formattedGame;
}

function downloadJSON(data, filename = "games.json") {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
