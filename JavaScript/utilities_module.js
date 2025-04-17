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

export function timeAgoFromUnix(unix) {
    const now = new Date();
    const past = new Date(unix * 1000);

    const years = now.getFullYear() - past.getFullYear();
    const months = now.getMonth() - past.getMonth() + (years * 12);
    const days = Math.floor((now - past) / (1000 * 60 * 60 * 24));

    if (years > 1 ){
        return `${years} ${years === 1 ? "year" : "years"} ago`;
    } else if (months > 1){
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

    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    console.log(luma);
    return .2126*r + .7152*g + .0722*b;
}