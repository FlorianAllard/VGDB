"use strict";

export function timeRemainingFromUnix(unix) {
  const now = Math.floor(Date.now() / 1000);
  const diff = unix - now;

  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);

  return [String(days).padStart(2, "0"), String(hours).padStart(2, "0"), String(minutes).padStart(2, "0")];
}

export function durationFromUnix(unix, format = "default") {
  const hours = Math.floor(unix / 3600);
  const minutes = Math.floor((unix % 3600) / 60);
  const seconds = Math.floor(unix % 60);
  const milliseconds = Math.floor((unix * 1000) % 1000);

  if(hours) {
     switch (format) {
       case "hours":
         return `${String(hours).padStart(2, "0")}h`;

       default:
         return `${hours > 0 ? String(hours).padStart(2, "0") + "h " : ""}${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s ${String(milliseconds).padStart(3, "0")}ms`;
     }
  } else return "-";
}

export function dateFromUnix(unix, day = true, month = true) {
  const date = new Date(unix * 1000);

  const dayStr = String(date.getDate());
  const monthStr = date.toLocaleString("en-US", { month: "long" });
  const yearStr = date.getFullYear();

  const isFuture = (unix * 1000) > Date.now();
  day = !(isFuture && dayStr == "31");
  month = !(isFuture && monthStr == "December");

  return `${day ? dayStr + " " : ""}${month ? monthStr + " " : ""}${yearStr}`;
}

export function timeAgoFromUnix(unix) {
  const now = new Date();
  const past = new Date(unix * 1000);

  const years = now.getFullYear() - past.getFullYear();
  const months = now.getMonth() - past.getMonth() + years * 12;
  const days = Math.floor((now - past) / (1000 * 60 * 60 * 24));

  if (years > 1) {
    return `${years} ${years === 1 ? "year" : "years"} ago`;
  } else if (months > 1) {
    return `${months} ${months === 1 ? "month" : "months"} ago`;
  } else {
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  }
}

export function colorToLuma(color) {
  color = color.substring(1);
  var rgb = parseInt(color, 16);
  var r = (rgb >> 16) & 0xff;
  var g = (rgb >> 8) & 0xff;
  var b = (rgb >> 0) & 0xff;

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function capitalize(string) {
  string = string.replace("_", " ");
  var split = string.toLowerCase().split(" ");
  for (let i = 0; i < split.length; i++) {
    split[i] = split[i].charAt(0).toUpperCase() + split[i].substring(1);
  }
  return split.join(" ");
}

export async function imageExists(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      resolve(img.height !== 0);
    };
    img.onerror = () => {
      resolve(false);
    };
  });
}

export function getVideoThumbnail(id) {
  return `https://img.youtube.com/vi/${id}/0.jpg`;
}

export async function getObjectFromUrl(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data from URL:", error);
    return null;
  }
}

export function getCurrencyGlyph(currency) {
  switch (currency) {
    case "EUR":
        return "€";
  
    default:
      return "?";
  }
}

export function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

export function startLoading(parent = document) {
  const templates = parent.querySelectorAll("template[data-loading-placeholders]");
  templates.forEach(template => {
    const amount = template.getAttribute("data-loading-placeholders");
    for (let i = 0; i < amount; i++) {
      const clone = template.content.firstElementChild.cloneNode(true);
      clone.classList.add("remove-after-loading");
      template.parentElement.appendChild(clone);
    }
  });
}

export function stopLoading(parent = document) {
  const loading = parent.querySelectorAll(".loading");
  loading.forEach((ld) => ld.classList.remove("loading"));

  const removeAfterLoading = parent.querySelectorAll(".remove-after-loading");
  removeAfterLoading.forEach((el) => el.remove());
}

export async function getDominantColor(img) {
  // Wait for the image to be fully loaded
  if (!img.complete || img.naturalWidth === 0) {
    await new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Image failed to load"));
    });
  }

  // Create a canvas and draw the image
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // Get pixel data
  let imageData;
  try {
    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  } catch (e) {
    console.error("Canvas is tainted or image not loaded:", e);
    return "rgb(0,0,0)";
  }

  const colorCount = {};
  let maxCount = 0;
  let dominantColor = "";

  // Loop through pixels
  for (let i = 0; i < imageData.length; i += 4) {
    const rgb = `${imageData[i]},${imageData[i + 1]},${imageData[i + 2]}`;
    colorCount[rgb] = (colorCount[rgb] || 0) + 1;
    if (colorCount[rgb] > maxCount) {
      maxCount = colorCount[rgb];
      dominantColor = rgb;
    }
  }

  return dominantColor ? `rgb(${dominantColor})` : "rgb(0,0,0)";
}
