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
let totalGames;
const sortBy = document.querySelector("#main-content--top--sort select");
sortBy.addEventListener("change", () => applyFilters());
let flagForPreload = false;

Utilities.startLoading();
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
  updateFilters(searchFilter, false);

  try {
    // Fetch filters data from JSON file
    const response = await fetch("/JavaScript/Data/filters.json");
    if (!response.ok) {
      throw new Error(`Failed to fetch filters.json: ${response.statusText}`);
    }

    filtersData = await response.json();
    filtersData = filtersData.sort((a, b) => a.name.localeCompare(b.name));
    await createAllFilters(); // Generate filters UI
  } catch (error) {
    console.error("Error loading filters:", error);
  }

  applyFilters();
}

/**
 * Creates all filters based on the loaded filters data.
 */
async function createAllFilters() {
  await Promise.all(
    filtersData.map(async (filter) => {
      switch (filter.type) {
        case "checkboxes":
          createCheckboxesFilter(filter);
          break;
        case "filterable_checkboxes":
          createFilterableCheckboxesFilter(filter);
          break;
        case "search":
          await createSearchFilter(filter);
          break;
        default:
          console.error("Filter type not recognized.");
          break;
      }
    })
  );

  // Add toggle functionality to filter sections
  document.querySelectorAll("#filters > section").forEach((section) => {
    const button = section.querySelector("button");
    const form = section.querySelector("div");
    const preview = section.querySelector("[class*='preview']");

    button.addEventListener("click", () => {
      toggleFilterSection(form, preview);
    });
    toggleFilterSection(form,preview,true);
  });

  // Attach event listeners to all filter inputs
  document.querySelectorAll("#filters input:not([type=search])").forEach((input) => {
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
function toggleFilterSection(form, preview, forceClose = false) {
  if (form.classList.contains("open") || forceClose) {
    // Close the form
    form.style.maxHeight = "0";
    form.classList.remove("open");
    preview.style.maxHeight = `calc(${preview.scrollHeight}px + 1rem + 24rem)`;
    preview.classList.add("open");
  } else {
    // Open the form
    form.style.maxHeight = `calc(${form.scrollHeight}px + 1rem + 24rem)`;
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

  // Check if filter.preload is present in the URL query params
  let preloadValue;
  if (filter.preload) {
    const params = new URLSearchParams(window.location.search);
    preloadValue = params.get(filter.preload);
  }

  section.querySelector("button h4").textContent = filter.name;

  const checkboxTemplate = section.querySelector("#filters--checkboxes--checkbox-template");
  values.forEach((value) => {
    const checkbox = checkboxTemplate.content.cloneNode(true).querySelector("li");

    // Configure checkbox input
    const input = checkbox.querySelector("input");
    input.setAttribute("name", value.name);
    input.setAttribute("id", `${filter.body}-${value.id}` + (value.additional ? `-${value.additional}` : ""));
    input.setAttribute("data-filter", filter.body);
    input.setAttribute("data-value", value.id);
    if (value.additional) {
      input.setAttribute("data-additional", value.additional);
    }

    // Configure preview item
    const preview = document.createElement("li");
    preview.textContent = value.name;
    previewParent.append(preview);

    if (preloadValue && preloadValue == value.id) {
      flagForPreload = true;
      input.checked = true;
      updateFilters(input);
    } else {
      preview.style.display = "none";
    }

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
    label.setAttribute("for", `${filter.body}-${value.id}` + (value.additional ? `-${value.additional}` : ""));
    label.textContent = value.name;

    checkboxTemplate.parentElement.append(checkbox);
  });

  template.parentElement.append(section);
}

/**
 * Creates a filter with searchable checkboxes.
 * @param {Object} filter - The filter data.
 */
function createFilterableCheckboxesFilter(filter) {
  const search = (value) => {
    const checkboxes = checkboxTemplate.parentElement.querySelectorAll("label");
    console.log(checkboxes);
    checkboxes.forEach((element) => (element.parentElement.style.display = element.textContent.toLowerCase().includes(value.toLowerCase()) ? "" : "none"));
  };

  const values = filter.values.sort((a, b) => a.name.localeCompare(b.name));
  const template = filtersParent.querySelector("#filters--filterable-checkboxes-template");
  const section = template.content.cloneNode(true).querySelector("section");
  const previewParent = section.querySelector(".filter--preview");

  // Check if filter.preload is present in the URL query params
  let preloadValue;
  if (filter.preload) {
    const params = new URLSearchParams(window.location.search);
    preloadValue = params.get(filter.preload);
  }

  const searchbar = section.querySelector("input[type=search]");
  searchbar.addEventListener("input", (event) => search(event.target.value));

  section.querySelector("button h4").textContent = filter.name;

  const checkboxTemplate = section.querySelector("#filters--checkboxes--checkbox-template");
  values.forEach((value) => {
    const checkbox = checkboxTemplate.content.cloneNode(true).querySelector("li");

    // Configure checkbox input
    const input = checkbox.querySelector("input");
    input.setAttribute("name", value.name);
    input.setAttribute("id", `${filter.body}-${value.id}`);
    input.setAttribute("data-filter", filter.body);
    input.setAttribute("data-value", value.id);

    // Configure preview item
    const preview = document.createElement("li");
    preview.textContent = value.name;
    previewParent.append(preview);

    if (preloadValue && preloadValue == value.id) {
      flagForPreload = true;
      input.checked = true;
      updateFilters(input);
    } else {
      preview.style.display = "none";
    }

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

async function createSearchFilter(filter) {
  // Check if filter.preload is present in the URL query params
  let preloadValue;
  if (filter.preload) {
    const params = new URLSearchParams(window.location.search);
    preloadValue = params.get(filter.preload);
  }

  let searchTimeout = null;
  const delayBeforeRequest = (value, searchWhere) => {
    clear();
    if (value.length > 3) Utilities.startLoading(section);
    clearTimeout(searchTimeout);
    searchTimeout = window.setTimeout(() => {
      request(value, searchWhere);
    }, 250);
  };

  const request = async (value, searchWhere, skipUI = false) => {
    let results = [];
    if (value.length > 3 || skipUI) {
      const where = skipUI ? `${searchWhere}=${value}` : `${searchWhere}~*"${value}"*`;
      results = await IGDB.makeRequest(filter.endpoint, filter.searchFields, "", 500, where);
      if (filter.searchResultsFilter) {
        results = results.filter((entry) => {
          return entry[filter.searchResultsFilter.key] === filter.searchResultsFilter.value;
        });
      }
      clear();
    }
    let
     parents = [];
    if (filter.duplicateKey) {
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const existingEntry = parents.find((entry) => entry.parent.id === result[filter.duplicateKey].id);
        if (existingEntry) {
          // If entry exists, add the new child id
          existingEntry.childIds.push(result[filter.valueKey]);
        } else {
          // Otherwise, create a new entry
          parents.push({ parent: result[filter.duplicateKey], childIds: [result[filter.valueKey]] });
        }
      }
    } else {
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        parents.push({ parent: result, childIds: result.id });
      }
    }
    
    parents.forEach((p) => {

      let preview;
      const createPreview = () => {
        preview = document.createElement("li");
        preview.textContent = p.parent.name;
        preview.addEventListener("click", () => {
          removePreview();
        });
        previewParent.append(preview);
        updateFiltersData(filter.body, p.childIds, "checkbox", true, "", !skipUI);
      };
      const removePreview = () => {
        updateFiltersData(filter.body, p.childIds, "checkbox", false);
        preview.remove();
        preview = null;
      };

      if(!skipUI) {
        const checkbox = checkboxTemplate.content.cloneNode(true).querySelector("li");
  
        // Configure checkbox input
        const input = checkbox.querySelector("input");
        input.setAttribute("name", p.parent.name);
        input.setAttribute("id", `${filter.body}-${p.childIds}`);
        input.setAttribute("data-filter", filter.body);
        input.setAttribute("data-value", p.childIds);
  
        // Add event listeners
        input.addEventListener("change", (event) => {
          if (event.target.checked) {
            createPreview();
          } else {
            removePreview();
          }
        });

        // Configure label
        const label = checkbox.querySelector("label");
        label.setAttribute("for", `${filter.body}-${p.childIds}`);
        label.textContent = p.parent.name;
        checkboxTemplate.parentElement.append(checkbox);
      } else {
        createPreview();
      }
    });

    Utilities.stopLoading(section);
  };

  const clear = () => {
    const checkboxes = Array.from(checkboxTemplate.parentElement.children).filter((el) => el.tagName === "LI");
    checkboxes.forEach((c) => c.remove());
  };

  const template = filtersParent.querySelector("#filters--search-template");
  const section = template.content.cloneNode(true).querySelector("section");
  const checkboxTemplate = section.querySelector("#filters--checkboxes--checkbox-template");
  const previewParent = section.querySelector(".filter--preview");
  section.querySelector("button h4").textContent = filter.name;
  const searchbar = section.querySelector("input[type=search]");
  searchbar.addEventListener("input", (event) => delayBeforeRequest(event.target.value, filter.searchWhere));

  if (preloadValue) {
    await request(preloadValue, filter.preloadKey, true);
    flagForPreload = true;
  }

  template.parentElement.append(section);
}

/**
 * Updates the current filters based on user input.
 * @param {HTMLInputElement} input - The input element that triggered the update.
 */
function updateFilters(input, apply = true) {
  const filterKey = input.getAttribute("data-filter");
  const value = input.getAttribute("data-value") || input.value;
  const inputType = input.getAttribute("type");
  const additional = input.getAttribute("data-additional");
  let inputValue = false;
  switch (inputType) {
    case "checkbox":
      inputValue = input.checked;
      break;
  
    default:
      break;
  }
  updateFiltersData(filterKey, value, inputType, inputValue, additional, apply);
}

function updateFiltersData(filterKey, value, inputType, inputValue, additional = "", apply = true) {
  toggleLoading(true);

  const additionalKey = additional ? additional.split("=")[0] : "";
  const additionalValue = additional ? additional.split("=")[1] : "";

  // Initialize the filter key in the object if it doesn't exist
  if (!currentFilters[filterKey]) {
    currentFilters[filterKey] = [];
    if(additionalKey && additionalValue) {
      currentFilters[additionalKey] = [];
    }
  }

  if (inputType === "checkbox") {
    function updateCheckboxFilter(key, val, checked) {
      if (checked) {
      // Add the value for checkboxes
      if (!currentFilters[key]?.includes(val)) {
        currentFilters[key]?.push(val);
      }
      } else {
      // Remove the value if unchecked
      currentFilters[key] = currentFilters[key].filter((v) => v !== val);

      // Remove the filter key if no values are active
      if (currentFilters[key].length === 0) {
        delete currentFilters[key];
      }
      }
    }
    updateCheckboxFilter(filterKey, value, inputValue);
    if(additionalKey && additionalValue) {
      updateCheckboxFilter(additionalKey, additionalValue, inputValue);
    }
  } else if (inputType === "search") {
    currentFilters[filterKey] = value;
  }

  console.log(currentFilters);
  if (apply) delayBeforeApplyingFilters();
}

/**
 * Delays the application of filters to avoid excessive API calls.
 */
function delayBeforeApplyingFilters() {
  clearTimeout(timeout);
  timeout = window.setTimeout(() => {
    currentPage = 0;
    applyFilters();
  }, 250);
}

/**
 * Applies the current filters by fetching and displaying filtered data.
 */
async function applyFilters() {
  toggleLoading(true);
  
  let fields = `*, cover.*, genres.*, websites.*`;
  let sort = `${sortBy.value}`;
  let where = "";
  let search = "";
  let page = `offset ${currentPage * amountPerPage};`;

  if (currentFilters["search"]) {
    if (sortBy.value !== "SEARCH") {
      where += `name~*"${currentFilters["search"]}"* & `;
      fields += `, ${sortBy.value}`;
    } else {
      search = ` search "${currentFilters["search"]}"; `;
      sort = "";
    }
  }
  
  const whereFilters = Object.entries(currentFilters).filter(([key]) => key !== "search");
  for (const [key, values] of whereFilters) {
    if (values!="null" && values.length > 0) {
      where += `${key}=(${values}) & `;
    } else {
      where += `${key}=${values} & `;
    }
  }
  where = where.replace(/ \& $/, ";");
  console.log(where);

  try {
    const [total, results] = await Promise.all([
      IGDB.requestTotalGames(where, search),
      IGDB.requestGames(fields, sort, `${amountPerPage}; offset ${currentPage * amountPerPage}`, where, search),
    ]);

    totalGames = total;
    const games = await IGDB.getCovers(results);
    updateCards(games);
    updatePages();
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

      card.setAttribute("href", `/HTML/game/?id=${game.id}`);

      // Add card to the DOM
      cards.push(card);
      template.parentElement.append(card);
    });
  }

  toggleLoading(false);
}

function toggleLoading(b) {
  if(b) {
    grid.classList.add("loading-opacity");
  } else {
    grid.classList.remove("loading-opacity");
    Utilities.stopLoading();
  }
}

function updatePages() {
  const pageControls = document.querySelectorAll("#main-content--pages button");
  const maxPages = Math.max(0, Math.ceil(totalGames.count / amountPerPage) - 1);
  
  for (let i = 0; i < pageControls.length; i++) {
    // Remove eventListener
    const control = pageControls[i].cloneNode(true);
    pageControls[i].parentNode.replaceChild(control, pageControls[i]);
    let index;

    switch(i) {
      case 0:
        control.addEventListener("click", () => goToPage(currentPage-1));
        control.classList.toggle("disabled", currentPage == 0);
        break;

      case 1:
        index = 0;
        control.textContent = index + 1;
        control.classList.toggle("current", currentPage == index);
        control.addEventListener("click", () => goToPage(index));
        break;

      case 2:
        index = Utilities.clamp(currentPage - 2, 1, Math.max(maxPages - 5, 1));
        control.textContent = index == 1 ? index + 1 : "...";
        control.classList.toggle("current", currentPage == index);
        control.addEventListener("click", () => goToPage(index));
        control.style.display = maxPages >= 1 ? "" : "none";
        break;

      case 3:
        index = Utilities.clamp(currentPage - 1, 2, Math.max(maxPages - 4, 2));
        control.textContent = index + 1;
        control.classList.toggle("current", currentPage == index);
        control.addEventListener("click", () => goToPage(index));
        control.style.display = maxPages >= 3 ? "" : "none";
        break;

      case 4:
        index = Utilities.clamp(currentPage, 3, Math.max(maxPages - 3, 3));
        control.textContent = index + 1;
        control.classList.toggle("current", currentPage == index);
        control.addEventListener("click", () => goToPage(index));
        control.style.display = maxPages >= 4 ? "" : "none";
        break;

      case 5:
        index = Utilities.clamp(currentPage + 1, 4, Math.max(maxPages - 2, 4));
        control.textContent = index + 1;
        control.classList.toggle("current", currentPage == index);
        control.addEventListener("click", () => goToPage(index));
        control.style.display = maxPages >= 5 ? "" : "none";
        break;

      case 6:
        index = Utilities.clamp(currentPage + 2, 5, Math.max(maxPages - 1, 5));
        control.textContent = index == maxPages - 1 ? index + 1 : "...";
        control.classList.toggle("current", currentPage == index);
        control.addEventListener("click", () => goToPage(index));
        control.style.display = maxPages >= 6 ? "" : "none";
        break;

      case 7:
        index = maxPages;
        control.textContent = index + 1;
        control.classList.toggle("current", currentPage == index);
        control.addEventListener("click", () => goToPage(index));
        control.style.display = maxPages >= 7 ? "" : "none";
        break;

      case 8:
        control.addEventListener("click", () => goToPage(currentPage + 1));
        control.classList.toggle("disabled", currentPage == maxPages);
        break;
    }
  }
}

async function goToPage(index) {
  currentPage = index;
  console.log("Go to page ", index);
  await applyFilters();
  document.querySelector("main").scrollTo({ top: 0, behavior: "smooth" });
}