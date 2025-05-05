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

export function dateFromUnix(unix) {
  const date = new Date(unix * 1000);

  const day = String(date.getDate());
  const month = date.toLocaleString("en-US", { month: "long" });
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
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

export function imageExists(url, callback) {
  var img = new Image();
  img.src = url;
  img.onload = () => {
    callback(img.height != 0);
  }
  img.onerror = () => {
    callback(false);
  }
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
