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
    console.log("signUp response:", json);
    return json;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function getGames(ids) {
  try {
    const response = await fetch(`http://localhost:3393/games/${ids.join("%2C")}`, {
      method: "GET",
    });
    const json = await response.json();
    console.log("getGames response:", json);
    return json;
  } catch (e) {
    console.error(e);
    return null;
  }
}
