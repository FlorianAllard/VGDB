"use strict";

// Importing modules
import * as Utilities from "./utilities_module.js";
import * as Requests from "./requests.js";

let parent;
let filters;
let userIndex = 0;
let criticsIndex = 0;
let reviewPerPage = 4;

export async function setupUserReviews(prnt, fltrs, showAverage = true) {
  parent = prnt;
  filters = fltrs;

    // Load HTML
    let loadedHTML;
    await fetch("/HTML/reviews_section_users.html")
      .then((res) => res.text())
      .then((text) => (loadedHTML = text));
    parent.innerHTML += loadedHTML;

    if(!showAverage) {
        parent.querySelector(".reviews_section-average").remove();
    }

    userIndex = 0;
    loadPage();
}

export async function loadPage() {
  let template = parent.querySelector("template");
  while (template.nextSibling) template.parentElement.removeChild(template.nextSibling);
  Utilities.startLoading(parent);

  filters.push(`limit=${reviewPerPage}`);
  filters.push(`offset=${reviewPerPage * userIndex}`);
  let response = await Requests.getReviews(filters);
  let reviews = response.data;

  Utilities.stopLoading();
}

export async function setupCriticsReviews(parent, showAverage = true) {
    // Load HTML
    let loadedHTML;
    await fetch("/HTML/reviews_section_critics.html")
      .then((res) => res.text())
      .then((text) => (loadedHTML = text));
    parent.innerHTML += loadedHTML;

    if(!showAverage) {
        parent.querySelector(".reviews_section-average").remove();
    }
}
