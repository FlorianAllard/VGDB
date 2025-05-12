"use strict";

// Importing modules
import * as Utilities from "./utilities_module.js";
import * as IGDB from "./APIs/igdb_api.js";

// Global variables
const grid = document.querySelector("#main-content--grid");
let filtersData = [];
let currentFilters = {};
const filtersParent = document.querySelector("#filters");
let timeout;
const cards = [];
let amountPerPage = 30;
let currentPage = 0;
const sortBy = document.querySelector("#main-content--top--sort select");
sortBy.addEventListener("change", () => applyFilters());

// Initialize filters on page load
loadFilters();

/**
 * Loads filters from a JSON file and sets up the search input.
 */
async function loadFilters() {
  const searchFilter = document.querySelector("#main-content--top--search input");

  // Attach event listener to search input
  searchFilter.addEventListener("input", (event) => {
    updateFilters(event.target);
  });

  // Pre-fill search input with query parameter if available
  searchFilter.value = new URLSearchParams(window.location.search).get("q") ?? "";
  const url = new URL(window.location);
  url.searchParams.delete("q");
  window.history.replaceState({}, "", url);
  updateFilters(searchFilter);

  try {
    // Fetch filters data from JSON file
    const response = await fetch("../JavaScript/Data/filters.json");
    if (!response.ok) {
      throw new Error(`Failed to fetch filters.json: ${response.statusText}`);
    }

    filtersData = await response.json();
    createAllFilters(); // Generate filters UI
  } catch (error) {
    console.error("Error loading filters:", error);
  }
}

/**
 * Creates all filters based on the loaded filters data.
 */
function createAllFilters() {
  filtersData.forEach((filter) => {
    switch (filter.type) {
      case "checkboxes":
        createCheckboxesFilter(filter);
        break;
      default:
        console.error("Filter type not recognized.");
        break;
    }
  });

  // Add toggle functionality to filter sections
  document.querySelectorAll("#filters > section").forEach((section) => {
    const button = section.querySelector("button");
    const form = section.querySelector("form");
    const preview = section.querySelector("[class*='preview']");

    button.addEventListener("click", () => {
      toggleFilterSection(form, preview);
    });
  });

  // Attach event listeners to all filter inputs
  document.querySelectorAll("#filters input").forEach((input) => {
    input.addEventListener("change", (event) => {
      updateFilters(event.target);
    });
  });
}

/**
 * Toggles the visibility of a filter section.
 * @param {HTMLElement} form - The form element to toggle.
 * @param {HTMLElement} preview - The preview element to toggle.
 */
function toggleFilterSection(form, preview) {
  if (form.classList.contains("open")) {
    // Close the form
    form.style.maxHeight = "0";
    form.classList.remove("open");
    preview.style.maxHeight = `calc(${preview.scrollHeight}px + 1rem)`;
    preview.classList.add("open");
  } else {
    // Open the form
    form.style.maxHeight = `calc(${form.scrollHeight}px + 1rem)`;
    form.classList.add("open");
    preview.style.maxHeight = "0";
    preview.classList.remove("open");
  }
}

/**
 * Creates a filter with checkboxes.
 * @param {Object} filter - The filter data.
 */
function createCheckboxesFilter(filter) {
  const values = filter.values.sort((a, b) => a.name.localeCompare(b.name));
  const template = filtersParent.querySelector("#filters--checkboxes-template");
  const section = template.content.cloneNode(true).querySelector("section");
  const previewParent = section.querySelector(".filter--preview");

  section.querySelector("button h4").textContent = filter.name;

  const checkboxTemplate = section.querySelector("#filters--checkboxes--checkbox-template");
  values.forEach((value) => {
    const checkbox = checkboxTemplate.content.cloneNode(true).querySelector("div");

    // Configure checkbox input
    const input = checkbox.querySelector("input");
    input.setAttribute("name", value.name);
    input.setAttribute("id", `${filter.body}-${value.id}`);
    input.setAttribute("data-filter", filter.body);
    input.setAttribute("data-value", value.id);

    // Configure preview item
    const preview = document.createElement("li");
    preview.style.display = "none";
    preview.textContent = value.name;
    previewParent.append(preview);

    // Add event listeners
    input.addEventListener("change", (event) => {
      preview.style.display = event.target.checked ? "" : "none";
    });
    preview.addEventListener("click", () => {
      input.checked = false;
      preview.style.display = "none";
      updateFilters(input);
    });

    // Configure label
    const label = checkbox.querySelector("label");
    label.setAttribute("for", `${filter.body}-${value.id}`);
    label.textContent = value.name;

    checkboxTemplate.parentElement.append(checkbox);
  });

  template.parentElement.append(section);
}

/**
 * Updates the current filters based on user input.
 * @param {HTMLInputElement} input - The input element that triggered the update.
 */
function updateFilters(input) {
  toggleLoading(true);

  const filterKey = input.getAttribute("data-filter");
  const value = input.getAttribute("data-value") || input.value;

  // Initialize the filter key in the object if it doesn't exist
  if (!currentFilters[filterKey]) {
    currentFilters[filterKey] = [];
  }

  if (input.type === "checkbox") {
    if (input.checked) {
      // Add the value for checkboxes
      if (!currentFilters[filterKey].includes(value)) {
        currentFilters[filterKey].push(value);
      }
    } else {
      // Remove the value if unchecked
      currentFilters[filterKey] = currentFilters[filterKey].filter((v) => v !== value);

      // Remove the filter key if no values are active
      if (currentFilters[filterKey].length === 0) {
        delete currentFilters[filterKey];
      }
    }
  } else if (input.type === "search") {
    currentFilters[filterKey] = value;
  }

  delayBeforeApplyingFilters();
}

/**
 * Delays the application of filters to avoid excessive API calls.
 */
function delayBeforeApplyingFilters() {
  clearTimeout(timeout);
  timeout = window.setTimeout(() => {
    applyFilters();
  }, 250);
}

/**
 * Applies the current filters by fetching and displaying filtered data.
 */
async function applyFilters() {
  toggleLoading(true);
  
  let fields = `*, cover.*, genres.*, websites.*`;
  let sort = `${sortBy.value} desc`;
  let where = "";
  let search = "";

  if (currentFilters["search"]) {
    if (sortBy.value !== "SEARCH") {
      where += `name~*"${currentFilters["search"]}"* & `;
      fields += `, ${sortBy.value}`;
    } else {
      search = ` search "${currentFilters["search"]}";`;
      sort = "";
    }
  }
  
  const whereFilters = Object.entries(currentFilters).filter(([key]) => key !== "search");
  for (const [key, values] of whereFilters) {
    where += `${key}=(${values}) & `;
  }
  where = where.replace(/ \& $/, ";");

  try {
    const [total, results] = await Promise.all([
      IGDB.requestTotalGames(where, search),
      IGDB.requestGames(fields, sort, `${amountPerPage}; offset ${currentPage * amountPerPage}`, where, search),
    ]);

    const games = await IGDB.getCovers(results);
    updateCards(games);
  } catch (error) {
    console.error("Error applying filters:", error);
  }
}

/**
 * Updates the displayed cards with the filtered games.
 * @param {Array} games - The filtered games data.
 */
function updateCards(games) {
  // Remove existing cards
  cards.forEach((card) => {
    card.remove();
  });

  if (games) {
    const template = document.querySelector("#main-content--grid template");
    games.forEach((game) => {
      const clone = template.content.cloneNode(true);
      const card = clone.querySelector("a");

      // Set card content
      card.querySelector("b").textContent = game.name;

      const genresParent = card.querySelector(".subtexts");
      if(game.genres) {
        for (let i = 0; i < Math.min(game.genres.length, 3); i++) {
          const li = document.createElement("li");
          const small = document.createElement("small");
          small.textContent = game.genres[i].name;
          li.appendChild(small);
          genresParent.appendChild(li);
        }
      } else {
        const li = document.createElement("li");
        const small = document.createElement("small");
        small.textContent = "-";
        li.appendChild(small);
        genresParent.appendChild(li);
      }

      if (game.cover) {
        card.querySelector(".cover").style.backgroundImage = `url(${game.cover.landscape_url})`;
        card.querySelector(".cover img").setAttribute("src", game.cover.landscape_url);
      } else {
        card.querySelector(".cover img").remove();
      }

      card.setAttribute("href", `/game/?id=${game.id}`);

      // Add card to the DOM
      cards.push(card);
      template.parentElement.append(card);
    });
  }

  toggleLoading(false);
}

function toggleLoading(b) {
  if(b) {
    grid.classList.add("loading");
  } else {
    grid.classList.remove("loading");
  }
}