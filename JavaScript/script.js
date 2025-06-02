"use strict";

import { Tooltip } from "./tooltip.js";

// Instantiate headers
const headerFetch = fetch("/HTML/header.html");
const footerFetch = fetch("/HTML/footer.html");

await Promise.all([headerFetch, footerFetch]).then((responses) => {
  responses[0].text().then((data) => {
    // document.body.innerHTML = data + document.body.innerHTML;
    const header = document.createElement("header");
    header.innerHTML = data;
    document.querySelector("main").prepend(header);

    const script = document.createElement("script");
    script.setAttribute("type", "module");
    script.setAttribute("src", "/JavaScript/searchbar.js");
    document.head.append(script);

    setupProfile();
  });
  responses[1].text().then((data) => {
    // document.body.innerHTML = document.body.innerHTML + data;
    const footer = document.createElement("footer");
    footer.innerHTML = data;
    document.querySelector("main").append(footer);
  });
});

function setupProfile() {
  const profileMenu = document.querySelector("#profile-menu");
  toggleProfileMenu(false);
  const profileButton = document.querySelector(".user-profile");
  profileButton.addEventListener("click", () => {
    toggleProfileMenu(profileMenu.style.display == "none");
  });
  document.addEventListener("click", (e) => {
    if (profileMenu.contains(e.target) == false && profileButton.contains(e.target) == false) {
      toggleProfileMenu(false);
    }
  })

  function toggleProfileMenu(toggle) {
    if(toggle) {
      profileMenu.style.removeProperty("display");
    } else {
      profileMenu.style.display = "none";
    }
  }
}