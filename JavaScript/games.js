"use strict";

// Importing modules
import { RatingStars } from "/Custom elements/Rating stars/rating-stars.js";
import * as Utilities from "./utilities_module.js";
import * as Requests from "./requests.js";
import * as OpenCritic from "./APIs/opencritic_api.js";
import * as IsThereAnyDeal from "./APIs/isthereanydeal_api.js";
import * as BackEnd from "./APIs/backend.js";
import * as Reviews from "./reviews_section.js";

// Global variables
let game;
let rating;
let reviews;
let prices;
let reviewEditor;
let collectionRadios;

// Main entry point
Utilities.startLoading();
let writeButton = document.querySelector("#write-review");
if (!localStorage.getItem("logged_in")) {
  writeButton.remove();
}

requestPageData();

/**
 * Fetches and processes game data for the current page.
 */
async function requestPageData() {
  const id = new URLSearchParams(window.location.search).get("id") ?? "1";
  let response = await Requests.getGames(`id=${id}`);
  game = response.data[0];
  console.log(game);

  document.title = game.name;

  rating = await OpenCritic.requestGame(game.name);
  console.log("Rating: ", rating);
  if(rating) {
    const reviewsData = await OpenCritic.requestReviews(rating.id);
    reviews = Array.isArray(reviewsData) ? reviewsData.slice(0, 6) : [];
    console.log("Reviews: ", reviews);
  }
  
  const itadGame = await IsThereAnyDeal.requestGame(game.slug);
  if (itadGame) {
    prices = await IsThereAnyDeal.requestPrices(itadGame.id);
    prices = prices[0];
    console.log("Prices: ", prices);
  }
 
  // Fill the page with game data
  fillPage();
}

/**
 * Populates the page with game data.
 */
function fillPage() {
  fillTop();
  fillAbout();
  fillLanguages();
  fillAgeRatings();
  fillReleases();
  // fillReviews();
  fillEditions();
  fillExpansions();
  fillDLCs();
  fillTimeToBeat();
  fillPrices();
  fillArtworks();
  fillScreenshots();
  fillVideos();

  const plot = document.querySelector("#main--plot");
  if (game.premise) {
    plot.querySelector("p").innerHTML = game.premise;
  } else {
    plot.remove();
  }

  initCollection();
  createTableOfContents();
  createExternalLinks();

  setupReviewEditor();
  writeButton.addEventListener("click", () => enableReviewEditor());

  Utilities.stopLoading();
}

/**
 * Fills the top section of the page with game details.
 */
function fillTop() {
  const banner = document.querySelector("#banner");
  if (game.covers.hero) {
    const bannerBackground = banner.querySelector("#banner--background");
    bannerBackground.setAttribute("src", game.covers.hero);

    const logo = banner.querySelector("#banner--logo");
      if (game.covers.logo) {
        logo.setAttribute("src", game.covers.logo);
      } else {
        logo.remove();
      }
  } else {
    banner.remove();
  }

  const top = document.querySelector("#main--top");
  top.querySelector("h1").textContent = game.name;
  top.querySelector("small").textContent = game.officialReleaseDate < Date.now() / 1000 
    ? `${Utilities.dateFromUnix(game.officialReleaseDate)} (${Utilities.timeAgoFromUnix(game.officialReleaseDate)})`
    : `${Utilities.dateFromUnix(game.officialReleaseDate)}`;
  top.querySelector("p").textContent = game.summary;

  const cover = top.querySelector("img");
    if (game.covers.portrait) {
      cover.setAttribute("src", game.covers.portrait);
    } else {
      cover.remove();
    }

  const iframe = top.querySelector("iframe");
  if (game.media.videos?.length > 0) {
    const video = game.media.videos.find((v) => v.name.includes("Launch")) ?? game.media.videos.at(-1);
    iframe.setAttribute("src", video.url);
  } else {
    iframe.style.visibility = "hidden";
  }
}

/**
 * Fills the "About" section with game metadata.
 */
function fillAbout() {
  orderPlatforms();
  createAboutList("#main--about--platforms", game.platforms, "name");
  createAboutList("#main--about--genres", game.genres, "name");
  createAboutList("#main--about--game-modes", game.gameModes, "name");
  createAboutList("#main--about--player-perspectives", game.playerPerspectives, "name");
  createAboutList("#main--about--themes", game.themes, "name");
  createAboutList("#main--about--developers", game.involvedCompanies.developers, "name");
  createAboutList("#main--about--publishers", game.involvedCompanies.publishers, "name");
  createAboutList("#main--about--game-engines", game.engines, "name");
  createAboutList("#main--about--series", game.gameSeries, "name");
  createAboutList("#main--about--franchises", game.franchises, "name");
}

/**
 * Creates a list of items for the "About" section.
 */
function createAboutList(parent, array, key, preloadKey = "id") {
  const container = document.querySelector(`${parent} td`);

  if (array?.length > 0) {
    for (let i = 0; i < array.length; i++) {
      const value = array[i];
      const a = document.createElement("a");
      a.textContent = value[key];
      a.setAttribute("href", `/HTML/search/?${parent.replace("#main--about--", "")}=${value[preloadKey]}`);
      container.append(a);

      if (i < array.length - 1) {
        container.innerHTML += ", ";
      }
    }
  } else {
    container.textContent = "-";
  }
}

/**
 * Orders platforms by family and generation.
 */
function orderPlatforms() {
  game.platforms = game.platforms.sort((a, b) => {
    if (a.family && b.family && a.family !== b.family) return a.family.id - b.family.id;
    else return a.generation - b.generation;
  });
}

/**
 * Fills the "Languages" section with supported languages.
 */
function fillLanguages() {
  const section = document.querySelector("#main--localization--languages");
  if (game.supportedLanguages.dubbings || game.supportedLanguages.subtitles || game.supportedLanguages.translations) {
    let languages = [];
    const max = Math.max(game.supportedLanguages.dubbings?.length, game.supportedLanguages.subtitles?.length, game.supportedLanguages.translations?.length);
    for (let i = 0; i < max; i++) {
      if(game.supportedLanguages.dubbings.length > i)
      {
        let language = languages.find((lang) => lang.id == game.supportedLanguages.dubbings[i].id);
        if (!language) {
          language = game.supportedLanguages.dubbings[i];
          languages.push(language);
        }
        language.audio = true;
      }
      if (game.supportedLanguages.subtitles.length > i) {
        let language = languages.find((lang) => lang.id == game.supportedLanguages.subtitles[i].id);
        if (!language) {
          language = game.supportedLanguages.subtitles[i];
          languages.push(language);
        }
        language.subtitles = true;
      }
      if (game.supportedLanguages.translations.length > i) {
        let language = languages.find((lang) => lang.id == game.supportedLanguages.translations[i].id);
        if (!language) {
          language = game.supportedLanguages.translations[i];
          languages.push(language);
        }
        language.interface = true;
      }
    }

    languages = languages.sort((a,b) => a.name.localeCompare(b.name));

    const table = section.querySelector("tbody");
    languages.forEach((language) => {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.textContent = language.name;
      tr.append(td);

      const tds = [];
      for (let i = 0; i < 3; i++) {
        const td = document.createElement("td");
        tds.push(td);
        tr.append(td);
      }

      tds[0].innerHTML = language.audio ? '<i class="fa-solid fa-check"></i>' : "";
      tds[1].innerHTML = language.subtitles ? '<i class="fa-solid fa-check"></i>' : "";
      tds[2].innerHTML = language.interface ? '<i class="fa-solid fa-check"></i>' : "";

      table.append(tr);
    });
  } else {
    section.remove();
  }
}

/**
 * Fills the "Age Ratings" section with rating information.
 */
function fillAgeRatings() {
  const section = document.querySelector("#main--localization--age-ratings");
  if (game.age_ratings?.length > 0) {
    game.age_ratings.forEach((rating) => {
      const element = section.querySelector(`#main--localization--age-ratings--${rating.system.name}`);
      if (element) {
        element.querySelector("img").setAttribute("src", `/Assets/Age ratings/${rating.rating}.svg`);
        const tooltip = element.querySelector("my-tooltip");
        if (rating.contents?.length > 0) {
          rating.contents.forEach((content) => {
            tooltip.innerHTML += content.description + "<br>";
          });
        } else {
          tooltip.remove();
        }
      }
    });
  } else {
    section.remove();
     const parent = document.querySelector("#main--localization");
     if (parent.lastElementChild.tagName !== "SECTION") {
       parent.remove();
     }
  }
}

/**
 * Fills the "Releases" section with release dates and platforms.
 */
function fillReleases() {
  const parent = document.querySelector("#main--releases tbody");
  game.regionalReleases = game.regionalReleases.sort((a,b) => a.date - b.date);
  game.regionalReleases.forEach((release) => {
    const tr = document.createElement("tr");

    if (release.date == game.official_release_date && game.regionalReleases.length > 1) tr.style.fontWeight = 600;

    const tdDate = document.createElement("td");
    tdDate.textContent = Utilities.dateFromUnix(release.date);
    tr.append(tdDate);

    const tdRelease = document.createElement("td");
    tdRelease.textContent = release.type.name;
    tr.append(tdRelease);

    const tdPlatforms = document.createElement("td");
    for (let i = 0; i < release.platforms.length; i++) {
      const platform = release.platforms[i];
      tdPlatforms.innerHTML += platform.name + (i < release.platforms.length - 1 ? "<br>" : "");
    }
    tr.append(tdPlatforms);

    const tdRegions = document.createElement("td");
    for (let i = 0; i < release.regions.length; i++) {
      const region = release.regions[i];
      tdRegions.innerHTML += region.name + (i < release.regions.length - 1 ? "<br>" : "");
    }
    tr.append(tdRegions);

    parent.append(tr);
  });
}

async function initCollection(){
  const parent = document.querySelector("#main--top--collection");
  collectionRadios = parent.querySelectorAll("input");

  if (localStorage.getItem("logged_in")) {
    parent.style.display = '';

    const userData = JSON.parse(localStorage.getItem("user"));
    const response = await Requests.getCollections([`user_id=${userData["id"]}`, `game_id=${game["id"]}`]);

    for (let i = 0; i < collectionRadios.length; i++) {
      const radio = collectionRadios[i];
      radio.disabled = false;
      radio.checked = response.data.length > 0
        ? radio.id.endsWith(response.data[0].category.name.toLowerCase())
        : false;

      const label = parent.querySelector(`[for="${radio.id}"]`);
      label.addEventListener("click", function (e) {
        e.preventDefault();
        setCollection(radio.checked ? -2 : i);
      });
    }
  }
}

async function setCollection(category) {  
  for (let i = 0; i < collectionRadios.length; i++) {
    const radio = collectionRadios[i];
    radio.disabled = true;
  }

  const userData = JSON.parse(localStorage.getItem("user"));
  const response = await Requests.setCollections([
    `user_id=${userData["id"]}`,
    `game_id=${game["id"]}`,
    `category_id=${category+1}`
  ]);

  for (let i = 0; i < collectionRadios.length; i++) {
    const radio = collectionRadios[i];
    radio.disabled = false;
    radio.checked = category == i;
  }
}

/**
 * Creates a table of contents for the page.
 */
function createTableOfContents() {
  const page = document.querySelector("#main-content");
  const headings = page.querySelectorAll("h2, h3");
  const table = document.createElement("ul");

  let item = document.createElement("li");
  let link = document.createElement("a");
  link.href = `#banner`;
  link.textContent = "(Top)";
  item.append(link);
  table.append(item);

  headings.forEach((heading) => {
    item = document.createElement("li");
    link = document.createElement("a");
    link.href = `#${heading.parentElement.id}`;
    link.textContent = heading.textContent;

    if (heading.tagName == "H3") {
      link.style.paddingLeft = "1rem";
    }

    item.append(link);
    table.append(item);
  });

  document.querySelector("#nav--table-of-contents").append(table);
}

/**
 * Creates external links for the game.
 */
function createExternalLinks() {
  const grid = document.createElement("div");
  grid.classList.add("grid");

  game.websites?.forEach((wb) => {
    let wbData = Utilities.getWebsiteFromUrl(wb.url);
    const a = document.createElement("a");
    a.setAttribute("href", wb.url);
    a.setAttribute("target", "_blank");
    a.style.backgroundColor = wbData.color;
    const img = document.createElement("img");
    if (Utilities.colorToLuma(wbData.color) < 200) {
      img.style.filter = "invert(95%) sepia(100%) saturate(14%) hue-rotate(213deg) brightness(104%) contrast(104%)";
    }
    img.setAttribute("src", wbData.icon);
    a.append(img);
    grid.append(a);
  });

  document.querySelector("#nav--external-links").append(grid);
}

function fillReviews() {
  let reception = document.querySelector("#main--reception");
  let user = JSON.parse(localStorage.getItem("user"));
  Reviews.setupUserReviews(reception, [
    `game_id=${game.id}`,
    `user_id!=${user ? user.id : -1}`]);
  Reviews.setupCriticsReviews(reception);

  // const section = document.querySelector("#main--reception");
  // if(rating && (game.rating || rating.topCriticScore >= 0)){
  //   const usersRating = section.querySelector("#main--reception--users");
  //   usersRating.querySelector("small").textContent = `Based on ${game.rating_count} reviews`;
  //   usersRating.querySelector(".rating span").textContent = Math.round(game.rating);
  //   usersRating.querySelector(".rating").classList.add(`rating-${Math.ceil(game.rating / 20)}`);
  //   const criticsRating = section.querySelector("#main--reception--critics");
  //   criticsRating.querySelector("small").textContent = `Based on ${rating.numTopCriticReviews} reviews`;
  //   criticsRating.querySelector(".rating span").textContent = Math.round(rating.topCriticScore);
  //   criticsRating.querySelector(".rating").classList.add(`rating-${Math.ceil(rating.topCriticScore / 20)}`);

  //   if (reviews?.length > 0) {
  //     reviews.forEach((review) => {
  //       const template = section.querySelector("template");
  //       let clone = template.content.firstElementChild.cloneNode(true);
  //       clone.querySelector("img").setAttribute("src", `https://img.opencritic.com/${review.Outlet.imageSrc.og}`);
  //       clone.querySelector("b").textContent = review.Outlet.name;
  //       clone.querySelector("small").textContent = review.alias;
  //       clone.querySelector("p").textContent = review.snippet;
  //       clone.setAttribute("href", review.externalUrl);
  //       const score = clone.querySelector(".rating");
  //       if (review.score) {
  //         score.querySelector("span").textContent = review.score;
  //         score.classList.add(`rating-${Math.ceil(review.score / 20)}`);
  //       } else {
  //         score.remove();
  //       }

  //       template.parentElement.append(clone);
  //     });
  //   }
  // } else {
  //   section.remove();
  // }
}

function fillEditions() {
  const section = document.querySelector("#main--additional-content--editions");
  if (game.versions?.length > 0) {
    const template = section.querySelector("template");
    const cards = [];

    for (let i = 0; i < game.versions.length; i++) {
      let clone = template.content.cloneNode(true);
      let card = clone.querySelector(".card");
      template.parentElement.appendChild(clone);

      cards.push(card);
    }

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const version = game.versions[i];

      const versionName = version.name.replace(game.name, "").replace(/[:\-–]\s*/, "");
      card.querySelector("b").textContent = versionName;

      if(version.cover) {
        const cover = card.querySelector(".cover");
        cover.style.backgroundImage = `url(${version.cover.portrait_url})`;
      }

      card.setAttribute("href", `/HTML/game/?id=${version.id}`);
    }
  } else {
    section.remove();
  }
}

function fillExpansions() {
  const section = document.querySelector("#main--additional-content--expansions");
  if (game.expansions?.length > 0) {
    const template = section.querySelector("template");
    const cards = [];

    for (let i = 0; i < game.expansions.length; i++) {
      let clone = template.content.cloneNode(true);
      let card = clone.querySelector(".card");
      template.parentElement.appendChild(clone);

      cards.push(card);
    }

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const expansion = game.expansions[i];

      card.querySelector("b").textContent = expansion.name.replace(`${game.name}: `, "").replace(`${game.name} - `, "");

      if(expansion.cover) {
        const cover = card.querySelector(".cover");
        cover.style.backgroundImage = `url(${expansion.cover.portrait_url})`;
      }

      const date = card.querySelector(".subtexts small");
      // date.textContent = expansion.name.replace(`${game.name}: `, "").replace(`${game.name} - `, "");

      card.setAttribute("href", `/HTML/game/?id=${expansion.id}`);
    }
  } else {
    section.remove();
  }
}

function fillDLCs() {
  const section = document.querySelector("#main--additional-content--dlcs");
  if (game.dlcs?.length > 0) {
    const template = section.querySelector("template");
    const cards = [];

    for (let i = 0; i < game.dlcs.length; i++) {
      let clone = template.content.cloneNode(true);
      let card = clone.querySelector(".card");
      template.parentElement.appendChild(clone);

      cards.push(card);
    }

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const dlc = game.dlcs[i];

      card.querySelector("b").textContent = dlc.name.replace(`${game.name}: `, "").replace(`${game.name} - `, "");

      if(dlc.cover) {
        const cover = card.querySelector(".cover");
        cover.style.backgroundImage = `url(${dlc.cover.portrait_url})`;
      }

      const date = card.querySelector(".subtexts small");
      // date.textContent = game.name;

      card.setAttribute("href", `/HTML/game/?id=${dlc.id}`);
    }
  } else {
    section.remove();
    const parent = document.querySelector("#main--additional-content");
    if (parent.lastElementChild.tagName !== "SECTION") {
      parent.remove();
    }
  }
}

function fillTimeToBeat() {
  const section = document.querySelector("#main--time-to-beat");
  if (game.timesToBeat?.minimum || game.timesToBeat?.normal || game.timesToBeat?.completionist || game.timesToBeat?.speedrun) {
    section.querySelector("#main--time-to-beat--minimum").textContent = Utilities.durationFromUnix(game.timesToBeat.minimum, "hours");
    section.querySelector("#main--time-to-beat--normal").textContent = Utilities.durationFromUnix(game.timesToBeat.normal, "hours");
    section.querySelector("#main--time-to-beat--completionist").textContent = Utilities.durationFromUnix(game.timesToBeat.completionist, "hours");
    section.querySelector("#main--time-to-beat--speedrun").textContent = Utilities.durationFromUnix(game.timesToBeat.speedrun);
  } else {
    section.remove();
  }
}

function fillPrices() {
  const section = document.querySelector("#main--prices");
  if (prices && prices.deals?.length > 0) {
    const table = section.querySelector("tbody");
    prices.deals.forEach((deal) => {
      const tr = document.createElement("tr");

      let td = document.createElement("td");
      td.textContent = deal.shop.name;
      tr.append(td);

      td = document.createElement("td");
      if (deal.drm?.length > 0) {
        deal.drm.forEach((d) => {
          if(d.name == "Drm Free") {
            td.textContent = "-"
          } else {
            let img = document.createElement("img");
            img.setAttribute("src", IGDB.getWebsiteFromUrl(d.name).icon);
            td.append(img);
          }
        });
      } else {
        let img = document.createElement("img");
        img.setAttribute("src", IGDB.getWebsiteFromUrl(deal.shop.name).icon);
        td.append(img);
      }
      
      tr.append(td);
    
      td = document.createElement("td");
      td.textContent = `${deal.regular.amount.toFixed(2)}${Utilities.getCurrencyGlyph(deal.regular.currency)}`;
      tr.append(td);

      td = document.createElement("td");
      if(deal.storeLow){
        const storeLowPercentage = (1 - (deal.storeLow.amountInt / deal.regular.amountInt)) * 100;
        const storeLowString = storeLowPercentage > 0 ? ` (-${Math.round(storeLowPercentage)}%)` : "";
        td.textContent = `${deal.storeLow.amount.toFixed(2)}${Utilities.getCurrencyGlyph(deal.storeLow.currency)}` + storeLowString;
        if (deal.storeLow.amount == deal.price.amount && deal.storeLow.amount < deal.regular.amount) {
          td.style.fontWeight = "600";
          td.style.color = "#00c851";
        }
      }
      tr.append(td);

      td = document.createElement("td");
      const pricePercentage = (1 - deal.price.amountInt / deal.regular.amountInt) * 100;
      const pricePercentageString = pricePercentage > 0 ? ` (-${Math.round(pricePercentage)}%)` : "";
      td.textContent = `${deal.price.amount.toFixed(2)}${Utilities.getCurrencyGlyph(deal.price.currency)}` + pricePercentageString;
      if(deal.price.amount < deal.regular.amount) {
        td.style.fontWeight = "600";
        td.style.color = "#00c851";
      }
      tr.append(td);

      table.append(tr);
      
      tr.addEventListener("click", () => {
        window.open(deal.url, "_blank").focus();
      });
    });
  } else {
    section.remove();
  }
}

function fillArtworks() {
  const section = document.querySelector("#main--media--artworks");
  if (game.media.artworks?.length > 0) {
    const parent = section.querySelector("ul");
    game.media.artworks.forEach((artwork) => {
      const li = document.createElement("li");
      li.classList.add("zoom");
      const img = document.createElement("img");
      img.src = artwork.url;

      li.addEventListener("click", () => enableMediaOverlay(artwork, true));

      li.append(img);
      parent.append(li);
    });
  } else {
    section.remove();
  }
}

function fillScreenshots() {
  const section = document.querySelector("#main--media--screenshots");
  if (game.media.screenshots?.length > 0) {
    const parent = section.querySelector("ul");
    game.media.screenshots.forEach((screenshot) => {
      const li = document.createElement("li");
      li.classList.add("zoom");
      const img = document.createElement("img");
      img.src = screenshot.url;

      li.addEventListener("click", () => enableMediaOverlay(screenshot, true));

      li.append(img);
      parent.append(li);
    });
  } else {
    section.remove();
  }
}

function fillVideos() {
  const section = document.querySelector("#main--media--videos");
  if (game.media.videos?.length > 0) {
    const parent = section.querySelector("ul");
    const template = section.querySelector("template");
    game.media.videos.forEach((video) => {
      const clone = template.content.firstElementChild.cloneNode(true);
      const div = clone.querySelector("div");
      div.style.backgroundImage = `url(${video.thumbnail})`;

      const span = clone.querySelector("span");
      span.textContent = video.name;

      clone.addEventListener("click", () => enableMediaOverlay(video, false));

      parent.append(clone);
    });
  } else {
    section.remove();
  }
}


const overlay = document.querySelector("#media-overlay");
const overlayImage = overlay.querySelector("img");
const overlayVideo = overlay.querySelector("iframe");

function enableMediaOverlay(element, isImage) {
  document.body.classList.add("stop-scrolling");
  overlay.addEventListener("click", disableMediaOverlay);
  
  if (isImage) {
    overlayImage.style.display = "block";
    overlayVideo.style.display = "none";
    overlayImage.setAttribute("src", "");
    overlayImage.setAttribute("src", element.url);
    overlayImage.onload = () => {
      overlay.setAttribute("open", "");
    };
  } else {
    overlayImage.style.display = "none";
    overlayVideo.style.display = "block";
    overlayVideo.setAttribute("src", element.url);
    overlay.setAttribute("open", "");
  }
}

function disableMediaOverlay(event) {
  if (event.target != overlay) return;
  
  overlayVideo.setAttribute("src", "");
  overlayImage.setAttribute("src", "");
  
  overlay.removeAttribute("open");
  document.body.classList.remove("stop-scrolling");
  overlay.removeEventListener("click", disableMediaOverlay);
}

function setupReviewEditor() {
  reviewEditor = document.querySelector("#review-editor");
  reviewEditor.querySelector("#review-editor--close").addEventListener("click", () => disableReviewEditor());
  let submit = reviewEditor.querySelector("input[type='submit']");

  reviewEditor.querySelector("h3").textContent = `Your review of ${game.name}`;
  reviewEditor.querySelector(".cover").style.backgroundImage = `url(${game.covers.portrait})`;
  let platformDropdown = reviewEditor.querySelector("select");
  game.platforms.forEach((platform) => {
    let option = document.createElement("option");
    option.setAttribute("value", platform.id);
    option.textContent = platform.name;
    platformDropdown.append(option);
  });
  let textArea = reviewEditor.querySelector("textarea");
  let stars = reviewEditor.querySelector("rating-stars");

  platformDropdown.addEventListener("change", () => updateSubmit());
  textArea.addEventListener("input", () => updateSubmit());
  stars.addEventListener("change", () => updateSubmit());
  updateSubmit();

  const form = reviewEditor.querySelector("form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    submitReview(form, stars.value);
  });

  function updateSubmit() {
    submit.disabled = platformDropdown.value == "placeholder" || textArea.value == "" || stars.value == 0;
  }
}
function enableReviewEditor() {
  document.body.classList.add("stop-scrolling");
  reviewEditor.setAttribute("open", true);
}
function disableReviewEditor() {
  reviewEditor.removeAttribute("open");
}
async function submitReview(form, rating){
  const formData = new FormData(form);
  formData.append("game", game.id);
  formData.append("rating", rating);
  formData.append("user", JSON.parse(localStorage.getItem("user")).id);
  const response = await Requests.publishReview(formData);
  if(response.status == 200) {
    disableReviewEditor();
  }
}