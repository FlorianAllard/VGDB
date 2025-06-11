"use strict";

import { Tooltip } from "./tooltip.js";
import * as Login from "./login.js";

// Instantiate headers
const headerFetch = fetch("/HTML/header.html");
const footerFetch = fetch("/HTML/footer.html");
const loginFetch = fetch("/HTML/login.html");

await Promise.all([headerFetch, footerFetch, loginFetch]).then((responses) => {
  responses[0].text().then((data) => {
    // document.body.innerHTML = data + document.body.innerHTML;
    const header = document.createElement("header");
    header.innerHTML = data;
    document.querySelector("main").prepend(header);

    const script = document.createElement("script");
    script.setAttribute("type", "module");
    script.setAttribute("src", "/JavaScript/searchbar.js");
    document.head.append(script);

    const loginButton = header.querySelector("#login_button");
    const userProfile = header.querySelector("#user_profile");
    const userMenu = header.querySelector("#user_profile-menu");
    userMenu.style.display = "none";
    if(localStorage.getItem("logged_in")) {
      loginButton.style.display = "none";
      header.querySelector("#logout_button").addEventListener("click", () => Login.logout());
      setupProfile(header);
    } else {
      userProfile.style.display = "none";
    }
  });

  responses[1].text().then((data) => {
    const footer = document.createElement("footer");
    footer.innerHTML = data;
    document.querySelector("main").append(footer);
  });

  responses[2].text().then((data) => {
    const login = document.createElement("dialog");
    login.id = "login_dialog";
    login.innerHTML = data;
    login.setAttribute("open", "");
    document.querySelector("body").append(login);
    document.querySelector("#login_button").addEventListener("click", () => {
      Login.toggleDisplay(true);
    });
    Login.default();
  });
});

function setupProfile(header) {
  const userData = JSON.parse(localStorage.getItem("user"));
  header.querySelector(".profile_picture").src = userData.profilePic;
  const profileMenu = header.querySelector("#user_profile-menu");
  toggleProfileMenu(false);
  const profileButton = header.querySelector("#user_profile");
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