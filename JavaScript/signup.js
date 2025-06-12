"use strict";

import * as Login from "./login.js";

let parent;
let content = null;
fetch("/HTML/signup.html")
  .then((res) => res.text())
  .then((html) => (content = html));

export default function init() {
    if (!content) return;

    // Create dialog
    parent = document.createElement("dialog");
    parent.innerHTML = content;
    parent.id = "signup_dialog";
    parent.setAttribute("open", true);
    document.querySelector("body").appendChild(parent);

    // Attach behavior
    parent.querySelector("#signup-close").addEventListener("click", (e) => removeSelf());
    parent.addEventListener("click", removeSelf);
    const form = parent.querySelector("form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      submitForm(form);
    });
    parent.querySelector("#login_button").addEventListener("click", (e) => {
      e.preventDefault();
      Login.default();
      removeSelf();
    });
}

function removeSelf(event = null) {
  if (event && event.target != parent) return;
  parent.removeAttribute("show");
  parent.remove();
  parent = null;
}

async function submitForm(form) {
  const formData = new FormData(form);
  try {
    const response = await fetch("http://localhost:3393/signup", {
      method: "POST",
      body: formData,
    });

    const json = await response.json();
    verifyUser(json);
  } catch (e) {
    console.error(e);
  }
}
