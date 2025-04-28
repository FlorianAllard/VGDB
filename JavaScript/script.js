"use strict";

import { Tooltip } from "./tooltip.js";

// Instantiate headers
const headerFetch = fetch("/HTML/header.html");
let headerHTML = "";
const footerFetch = fetch("/HTML/footer.html");
let footerHTML = "";
Promise.all([headerFetch, footerFetch]).then((responses) => {
  responses[0].text().then((data) => {
    // document.body.innerHTML = data + document.body.innerHTML;
    const header = document.createElement("header");
    header.innerHTML = data
    document.querySelector("main").prepend(header);
  });
  responses[1].text().then((data) => {
    // document.body.innerHTML = document.body.innerHTML + data;
    const footer = document.createElement("footer");
    footer.innerHTML = data;
    footer.classList.add("dark-mode");
    document.querySelector("main").append(footer);
  });
});