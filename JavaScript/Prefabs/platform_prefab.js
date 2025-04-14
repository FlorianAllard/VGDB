"use strict";

export default class PlatformPrefab extends HTMLElement {
  static supportedPlatforms = ["xbox", "playstation", "pc", "switch", "mac", "ios", "linux", "android", "dos", "wii u", "wii", "ds", "game boy", "game boy", "gamecube"];

  platform = "";
  abbreviation = "";
  #parentElement = null;
  #linkElement = null;
  #logoElement = null;

  platformColor = function () {
    switch (this.platform) {
      case "pc":
        return "#009CEA";
      case "xbox":
        return "#0E7A0D";
      case "playstation":
        return "#003F97";
      case "switch":
      case "wii":
      case "wii u":
      case "ds":
      case "advance":
      case "game boy":
      case "gamecube":
        return "#DF0011";
      case "mac":
      case "ios":
        return "#B3B3B3";
      case "linux":
        return "#F79400";
      case "android":
        return "#9FC037";

      default:
        return "#3A3B3C";
    }
  };

  set(data) {
    for (let i = 0; i < PlatformPrefab.supportedPlatforms.length; i++) {
      if (data.name.toLowerCase().includes(PlatformPrefab.supportedPlatforms[i])) {
        this.platform = PlatformPrefab.supportedPlatforms[i];
        break;
      }
    }

    this.#parentElement = document.createElement("li");
    this.#linkElement = document.createElement("a");

    this.abbreviation = data.name;
    this.#linkElement.textContent = this.abbreviation;

    this.#linkElement.style.backgroundColor = this.platformColor();
    this.#parentElement.append(this.#linkElement);
    this.append(this.#parentElement);
  }
}
export { PlatformPrefab };

customElements.define("platform-prefab", PlatformPrefab);
