"use strict";

import * as Signup from "./signup.js";
import * as Requests from "./requests.js";

let parent;
let content = null;
fetch("/HTML/login.html")
  .then((res) => res.text())
  .then((html) => (content = html));

export default function init(signup) {
    if (!content) return;
    
    // Create dialog
    parent = document.createElement("dialog");
    parent.innerHTML = content;
    parent.id = "login_dialog";
    parent.setAttribute("open", true);
    document.querySelector("body").appendChild(parent);

    // Attach behavior
    parent.querySelector("#login-close").addEventListener("click", (e) => removeSelf());
    parent.addEventListener("click", removeSelf);
    const form = parent.querySelector("form");
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        tryLoggingIn(form);
    });
    parent.querySelector("#signup_button").addEventListener("click", (e) => {
        e.preventDefault();
        Signup.default();
        removeSelf();
    });
}

function removeSelf(event = null) {
    if (event && event.target != parent) return;
    parent.removeAttribute("show");
    parent.remove();
    parent = null;
}

async function tryLoggingIn(form) {
    const formData = new FormData(form);
    const result = await Requests.logIn(formData);
    if(result == null) return;

    if(result.status != 200) {
      const emailField = parent.querySelector("#login-email");
      const emailError = parent.querySelector("#login-email-error span");
      const passwordField = parent.querySelector("#login-password");
      const passwordError = parent.querySelector("#login-password-error span");

      for (const [key, value] of Object.entries(result.data)) {
        switch (key) {
          case "email":
            emailField.classList.add("error");
            emailError.textContent = value;
            emailField.addEventListener("change", (e) => {
              emailField.classList.remove("error");
              emailError.textContent = "";
            });
            break;
          case "password":
            passwordField.classList.add("error");
            passwordError.textContent = value;
            passwordField.addEventListener("change", (e) => {
              passwordField.classList.remove("error");
              passwordError.textContent = "";
            });
            break;
          default:
            break;
        }
      }
    } else {
        localStorage.setItem("logged_in", true);
        localStorage.setItem("user", JSON.stringify(result.data));
        location.reload();  
    }
}

export function logout() {
    localStorage.removeItem("logged_in");
    localStorage.removeItem("user");
    location.reload();
}