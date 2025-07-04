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

export async function getGames(filters) {
  try {
    const params = new URLSearchParams();

    if (typeof filters === "string" && filters.trim()) {
      // If filters is a single string like "game_id=103298"
      const [key, value] = filters.split("=");
      if (key && value) {
        params.append(key, value);
      }
    }

    if (Array.isArray(filters) && filters.length > 0) {
      // If filters is an array of strings like ["game_id=103298", "createdBefore=2024-01-01"]
      filters.forEach((f) => {
        const [key, value] = f.split("=");
        if (key && value) {
          params.append(key, value);
        }
      });
    }

    const url = `http://localhost:3393/games${params.toString() ? `?${params.toString()}` : ""}`;
    console.log(url);

    const response = await fetch(url, {
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

export async function publishReview(params) {
  try {
    const response = await fetch(`http://localhost:3393/reviews/publish`, {
      method: "POST",
      body: params,
    });
    const json = await response.json();
    console.log("publishReview response:", json);
    return json;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function getReviews(filters = []) {
  try {
    const params = new URLSearchParams();

    if (typeof filters === "string" && filters.trim()) {
      // If filters is a single string like "game_id=103298"
      const [key, value] = filters.split("=");
      if (key && value) {
        params.append(key, value);
      }
    }

    if (Array.isArray(filters) && filters.length > 0) {
      // If filters is an array of strings like ["game_id=103298", "createdBefore=2024-01-01"]
      filters.forEach((f) => {
        const [key, value] = f.split("=");
        if (key && value) {
          params.append(key, value);
        }
      });
    }

    const url = `http://localhost:3393/reviews${params.toString() ? `?${params.toString()}` : ""}`;
    console.log(url);

    const response = await fetch(url, {
      method: "GET",
    });
    const json = await response.json();
    console.log("getReviews response:", json);
    return json;
  } catch (e) {
    console.error(e);
    return null;
  }
}
