"use strict";

// Import modules
import { Tooltip } from "./tooltip.js";
import * as Login from "./login.js";
import * as Signup from "./signup.js";

// Fetch header and footer HTML
const headerFetch = fetch("/HTML/header.html");
const footerFetch = fetch("/HTML/footer.html");

// Load header and footer, then initialize page
await Promise.all([headerFetch, footerFetch]).then(async ([headerRes, footerRes]) => {
  // Insert header
  const headerHTML = await headerRes.text();
  const header = document.createElement("header");
  header.innerHTML = headerHTML;
  document.querySelector("main").prepend(header);

  // Dynamically load searchbar script
  const searchbarScript = document.createElement("script");
  searchbarScript.type = "module";
  searchbarScript.src = "/JavaScript/searchbar.js";
  document.head.append(searchbarScript);

  // Setup login/profile UI
  const loginButton = header.querySelector("#login_button");
  const userProfile = header.querySelector("#user_profile");
  const userMenu = header.querySelector("#user_profile-menu");
  userMenu.style.display = "none";

  if (localStorage.getItem("logged_in")) {
    // User is logged in
    loginButton.style.display = "none";
    header.querySelector("#logout_button").addEventListener("click", Login.logout);
    setupProfile(header);
  } else {
    // User is not logged in
    userProfile.style.display = "none";
    loginButton.addEventListener("click", Login.default);
  }

  // Insert footer
  const footerHTML = await footerRes.text();
  const footer = document.createElement("footer");
  footer.innerHTML = footerHTML;
  document.querySelector("main").append(footer);
});

/** Setup user profile menu and events
 * @param {HTMLElement} header 
 */
function setupProfile(header) {
  const userData = JSON.parse(localStorage.getItem("user"));
  const profileMenu = header.querySelector("#user_profile-menu");
  const profileButton = header.querySelector("#user_profile");

  // Set profile picture
  header.querySelector(".profile_picture").src = userData.picture.path;

  // Set profile link with user ID
  profileMenu.querySelector("[href='/HTML/profile/']")
    .setAttribute("href", `/HTML/profile/?id=${userData.id}`);

  // Hide menu initially
  toggleProfileMenu(false);

  // Toggle menu on profile button click
  profileButton.addEventListener("click", () => {
    toggleProfileMenu(profileMenu.style.display === "none");
  });

  // Hide menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!profileMenu.contains(e.target) && !profileButton.contains(e.target)) {
      toggleProfileMenu(false);
    }
  });

  /** Show or hide the profile menu
   * @param {boolean} show 
   */
  function toggleProfileMenu(show) {
    profileMenu.style.display = show ? "" : "none";
  }
}
