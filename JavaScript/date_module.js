"use strict";

export function timeRemainingFromUnix(unix) {
    const now = Math.floor(Date.now() / 1000);
    const diff = unix - now;

    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    return [String(days).padStart(2, "0"), String(hours).padStart(2, "0"), String(minutes).padStart(2, "0")];
}

export function dateFromUnix(unix) {
    const date = new Date(unix * 1000);
    const day = String(date.getDate());
    const month = date.toLocaleString("en-US", {month: "long"});
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}