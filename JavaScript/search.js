"use strict";

// Importing modules
import * as Utilities from "./utilities_module.js";
import * as IGDB from "./APIs/igdb_api.js";

let filtersData = [];
let currentFilters = {};
const filtersParent = document.querySelector("#filters");
let timeout;
const cards = [];
let amountPerPage = 100;
let currentPage = 0;

loadFilters();
async function loadFilters() {
  const searchFilter = document.querySelector("#main-content--top--search input");
  searchFilter.addEventListener("input", (event) => {
    updateFilters(event.target)
  });
  searchFilter.value = new URLSearchParams(window.location.search).get("q") ?? "";
  updateFilters(searchFilter);

  try {
    const response = await fetch("/JavaScript/Data/filters.json"); // Fetch the JSON file
    if (!response.ok) {
      throw new Error(`Failed to fetch filters.json: ${response.statusText}`);
    }
    filtersData = await response.json(); // Parse the JSON content
    createAllFilters(); // Call the function after loading the filters
  } catch (error) {
    console.error("Error loading filters:", error);
  }
}

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

  document.querySelectorAll("#filters > section").forEach((section) => {
    const button = section.querySelector("button");
    const form = section.querySelector("form");
    const preview = section.querySelector("[class*='preview']");

    button.addEventListener("click", () => {
      if (form.classList.contains("open")) {
        // Close the form
        form.style.maxHeight = "0";
        form.classList.remove("open");
        preview.style.maxHeight = `calc(${preview.scrollHeight}px + 1rem)`;
        preview.classList.add("open");
      } else {
        // Open the form
        form.style.maxHeight = `calc(${form.scrollHeight}px + 1rem)`; // Dynamically set height
        form.classList.add("open");
        preview.style.maxHeight = `0`;
        preview.classList.remove("open");
      }
    });
  });

  // Attach event listeners to all filter inputs
  document.querySelectorAll("#filters input").forEach((input) => {
    input.addEventListener("change", (event) => {
      updateFilters(event.target);
    });
  });
}

function createCheckboxesFilter(filter) {
  const values = filter.values.sort((a, b) => a.name.localeCompare(b.name));

  const template = filtersParent.querySelector("#filters--checkboxes-template");
  const section = template.content.cloneNode(true).querySelector("section");
  const previewParent = section.querySelector(".filter--preview");

  section.querySelector("button h4").textContent = filter.name;

  const checkboxTemplate = section.querySelector("#filters--checkboxes--checkbox-template");
  values.forEach(value => {
    const checkbox = checkboxTemplate.content.cloneNode(true).querySelector("div");

    const input = checkbox.querySelector("input");
    input.setAttribute("name", value.name);
    input.setAttribute("id", `${filter.body}-${value.id}`);
    input.setAttribute("data-filter", filter.body);
    input.setAttribute("data-value", value.id);

    const preview = document.createElement("li");
    preview.style.display = "none";
    preview.textContent = value.name;
    previewParent.append(preview);
    input.addEventListener("change", (event) => {
      console.log(event.target.value);
      preview.style.display = (event.target.checked ? "" : "none");
    });
    preview.addEventListener("click", () => {
      input.checked = false;
      preview.style.display = "none";
      updateFilters(input);
    });

    const label = checkbox.querySelector("label");
    label.setAttribute("for", `${filter.body}-${value.id}`);
    label.textContent = value.name;

    checkboxTemplate.parentElement.append(checkbox);

  });

  template.parentElement.append(section);
}

function updateFilters(input) {
  const filterKey = input.getAttribute("data-filter"); // e.g., "genres"
  const value = input.getAttribute("data-value") || input.value; // e.g., "31" or slider value

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
  } else if (input.type == "search") {
    currentFilters[filterKey] = value;
  }

  console.log(currentFilters); // Debug: Log the active filters object
  delayBeforeApplyingFilters();
}

function delayBeforeApplyingFilters() {
  clearTimeout(timeout);
  timeout = window.setTimeout(() => {
    applyFilters();
  }, 250);
}

async function applyFilters() {
  let search = currentFilters["search"] != "" ? ` search "${currentFilters["search"]}";` : "";

  let where = "";
  const whereFilters = Object.entries(currentFilters).filter(([key]) => key !== "search");
  for (const [key, values] of whereFilters) {
    where += `${key}=(${values}) & `;
  }
  where = where.replace(/ \& $/, ";");
  console.log("where " + where);

  const [total, results] = await Promise.all([
    IGDB.requestTotalGames(where, search),
    IGDB.requestGames("*, cover.*, genres.*, websites.*", "", `${amountPerPage}; offset ${currentPage * amountPerPage}`, where, search)
  ]);
  const games = IGDB.getCovers(results);
  console.log(total);

  updateCards(games);
}

function updateCards(games) {
  cards.forEach((card) => {
    card.remove();
  });

  if(games) {
    const template = document.querySelector("#main-content--grid template");
    games.forEach((game) => {
      const clone = template.content.cloneNode(true);
      const card = clone.querySelector("a");

      card.querySelector("b").textContent = game.name + (game.first_release_date ? ` (${Utilities.dateFromUnix(game.first_release_date, false, false)})` : "");

      if (game.cover) {
        card.querySelector(".cover").style.backgroundImage = `url(${game.cover.landscape_url})`;
        card.querySelector(".cover img").setAttribute("src", game.cover.landscape_url);
      } else {
        card.querySelector(".cover img").remove();
      }

      card.setAttribute("href", `/HTML/game/?id=${game.id}`);

      cards.push(card);
      template.parentElement.append(card);
    });
  }
}