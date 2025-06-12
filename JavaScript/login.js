"use strict";

let parent;

export default function init() {
    parent = document.querySelector("#login_dialog");
    parent.querySelector("#login-close").addEventListener("click", () => toggleDisplay(false));
    parent.addEventListener("click", disableDisplay);
    const form = parent.querySelector("form");
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        submitForm(form);
    });
    toggleDisplay(false);
}

export function toggleDisplay(toggle) {
    if(toggle) {
        enableDisplay();
    } else {
        disableDisplay();
    }
}

function enableDisplay() {
    parent.setAttribute("show", "");
}

function disableDisplay(event = null) {
    if (event && event.target != parent) return;
    parent.removeAttribute("show");
}

async function submitForm(form) {
    const formData = new FormData(form);
    try {
        const response = await fetch("http://localhost:3393/login", {
            method: "POST",
            body: formData,
        });

        const json = await response.json();
        verifyUser(json);
    } catch (e) {
        console.error(e);
    }
}

function verifyUser(json) {
    if(json.status==200) {
        localStorage.setItem("logged_in", true);
        localStorage.setItem("user", JSON.stringify(json.data));
        location.reload();
    } else {
        const emailField = parent.querySelector("#login-email");
        const emailError = parent.querySelector("#login-email-error span");
        const passwordField = parent.querySelector("#login-password");
        const passwordError = parent.querySelector("#login-password-error span");

        for (const [key, value] of Object.entries(json.data)) {
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
    }
}

export function logout() {
    localStorage.removeItem("logged_in");
    localStorage.removeItem("user");
    location.reload();
}