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
        const container = parent.querySelector(".error-container");
        container.innerHTML = "";
        const emailField = parent.querySelector("#login-email");
        emailField.classList.remove("error");
        const passwordField = parent.querySelector("#login-password");
        passwordField.classList.remove("error");

        for (const [key, value] of Object.entries(json.data)) {
            const errorElement = document.createElement("li");
            errorElement.classList.add("error");
            errorElement.textContent = value;
            container.appendChild(errorElement);
            switch (key) {
                case "email":
                    emailField.classList.add("error");
                    break;
                case "password":
                    passwordField.classList.add("error");
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