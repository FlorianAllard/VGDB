"use strict";

// Import modules
import * as Login from "./login.js";
import * as Requests from "./requests.js";

// Globals
let parent = null;
let content = null;
let passwordTooltip = null;

// Preload signup HTML content
fetch("/HTML/signup.html")
  .then((res) => res.text())
  .then((html) => (content = html));

/** Initialize signup dialog
 */
export default function init() {
  if (!content) return;

  // Insert captcha script
  const script = document.createElement('script');
  script.src = "https://www.google.com/recaptcha/api.js";
  script.setAttribute("async", true);
  script.setAttribute("defer", true);
  document.head.append(script);

  // Create and configure dialog
  parent = document.createElement("dialog");
  parent.innerHTML = content;
  parent.id = "signup_dialog";
  parent.setAttribute("open", true);
  document.body.appendChild(parent);

  // Password tooltip logic
  passwordTooltip = parent.querySelector("#signup-password-tooltip");
  const passwordInput = parent.querySelector("#signup-password");
  passwordInput.addEventListener("input", updatePasswordTooltip);
  passwordInput.addEventListener("click", updatePasswordTooltip);

  // Close dialog handlers
  parent.querySelector("#signup-close").addEventListener("click", (e) => removeSelf());
  parent.addEventListener("click", removeSelf);

  // Form submit handler
  const form = parent.querySelector("form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    trySigningUp(form);
  });

  // Switch to login dialog
  parent.querySelector("#login_button").addEventListener("click", (e) => {
    e.preventDefault();
    Login.default();
    removeSelf();
  });
}

/** Remove signup dialog from DOM
 */
function removeSelf(event = null) {
  debugger;
  if (event && event.target !== parent) return;
  parent.removeAttribute("show");
  parent.remove();
  parent = null;
}

/** Attempt to sign up with form data
 */
async function trySigningUp(form) {
  const formData = new FormData(form);
  const result = await Requests.signUp(formData);
  if (!result) return;

  if (result.status !== 200) {
    showFieldErrors(result.data);
  } else {
    // Success: store login state and reload
    localStorage.setItem("logged_in", true);
    // Remove password before storing user data
    if (result.data[0]) delete result.data[0].password;
    localStorage.setItem("user", JSON.stringify(result.data[0]));
    location.reload();
  }
}

/** Show field errors and attach listeners to clear them on change
 */
function showFieldErrors(errors) {
  debugger;
  const fields = {
    username: {
      field: parent.querySelector("#signup-username"),
      error: parent.querySelector("#signup-username-error span"),
    },
    email: {
      field: parent.querySelector("#signup-email"),
      error: parent.querySelector("#signup-email-error span"),
    },
    password: {
      field: parent.querySelector("#signup-password"),
      error: parent.querySelector("#signup-password-error span"),
    },
    passwordConfirm: {
      field: parent.querySelector("#signup-password_confirm"),
      error: parent.querySelector("#signup-password_confirm-error span"),
    },
    captcha: {
      field: parent.querySelector("#signup-captcha"),
      error: parent.querySelector("#signup-captcha-error span"),
    },
  };

  for (const [key, value] of Object.entries(errors)) {
    if (fields[key]) {
      const { field, error } = fields[key];
      field.classList.add("error");
      error.textContent = value;
      field.addEventListener("change", function clearError() {
        field.classList.remove("error");
        error.textContent = "";
        field.removeEventListener("change", clearError);
      });
    }
  }
}

/** Update password tooltip based on input value
 */
function updatePasswordTooltip(e) {
  const value = e.target.value;
  const items = passwordTooltip.querySelectorAll("li");
  items[0].classList.toggle("error", value.length < 8);
  items[1].classList.toggle("error", !/[a-z]/.test(value));
  items[2].classList.toggle("error", !/[A-Z]/.test(value));
  items[3].classList.toggle("error", !/[0-9]/.test(value));
  items[4].classList.toggle("error", !/[!@#$%^&*(),.?":{}|<>_\-\\[\];'`~]/.test(value));
}
