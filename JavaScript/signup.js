"use strict";

import * as Login from "./login.js";
import * as Requests from "./requests.js";

let parent;
let content = null;
fetch("/HTML/signup.html")
  .then((res) => res.text())
  .then((html) => (content = html));

let passwordTooltip;

export default function init() {
    if (!content) return;

    // Create dialog
    parent = document.createElement("dialog");
    parent.innerHTML = content;
    parent.id = "signup_dialog";
    parent.setAttribute("open", true);
    document.querySelector("body").appendChild(parent);

    passwordTooltip = parent.querySelector("#signup-password-tooltip");
    const passwordInput = parent.querySelector("#signup-password");
    passwordInput.addEventListener("input", (e) => {
      updatePasswordTooltip(e);
    });
    passwordInput.addEventListener("click", (e) => {
      updatePasswordTooltip(e);
    });

    // Attach behavior
    parent.querySelector("#signup-close").addEventListener("click", (e) => removeSelf());
    parent.addEventListener("click", removeSelf);
    const form = parent.querySelector("form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      trySigningUp(form);
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

async function trySigningUp(form) {
    const formData = new FormData(form);
    const result = await Requests.signUp(formData);
    if(result == null) return;

    if (result.status != 200) {
      const usernameField = parent.querySelector("#signup-username");
      const usernameError = parent.querySelector("#signup-username-error span");
      const emailField = parent.querySelector("#signup-email");
      const emailError = parent.querySelector("#signup-email-error span");
      const passwordField = parent.querySelector("#signup-password");
      const passwordError = parent.querySelector("#signup-password-error span");
      const passwordConfirmField = parent.querySelector("#signup-password_confirm");
      const passwordConfirmError = parent.querySelector("#signup-password_confirm-error span");

      for (const [key, value] of Object.entries(result.data)) {
        switch (key) {
          case "username":
            usernameField.classList.add("error");
            usernameError.textContent = value;
            usernameField.addEventListener("change", (e) => {
              usernameField.classList.remove("error");
              usernameError.textContent = "";
            });
            break;
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
          case "passwordConfirm":
            passwordConfirmField.classList.add("error");
            passwordConfirmError.textContent = value;
            passwordConfirmField.addEventListener("change", (e) => {
              passwordConfirmField.classList.remove("error");
              passwordConfirmError.textContent = "";
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

function updatePasswordTooltip(e) {
  const items = passwordTooltip.querySelectorAll("li");
  items[0].classList.toggle("error", e.target.value.length < 8);
  items[1].classList.toggle("error", !/[a-z]/.test(e.target.value));
  items[2].classList.toggle("error", !/[A-Z]/.test(e.target.value));
  items[3].classList.toggle("error", !/[0-9]/.test(e.target.value));
  items[4].classList.toggle("error", !/[!@#$%^&*(),.?":{}|<>_\-\\[\];'`~]/.test(e.target.value));
}
