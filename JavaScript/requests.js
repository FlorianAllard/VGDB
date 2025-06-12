"use strict";

export async function logIn(params) {
    try {
        const response = await fetch("http://localhost:3393/users/login", {
          method: "POST",
          body: params,
        });
        const json = await response.json();
        console.log(json);
        return json;
    } catch (e) {
        console.error(e);
        return null;
    }
}

export async function signUp(params) {
    try {
        const response = await fetch("http://localhost:3393/users/signup", {
          method: "POST",
          body: params,
        });
        const json = await response.json();
        console.log(json);
        return json;
    } catch (e) {
        console.error(e);
        return null;
    }
}