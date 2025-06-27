"use strict";

export class RatingStars extends HTMLElement {
  value = 0.5;
  #stars = [];

  static full = "fa-solid fa-star";
  static half = "fa-solid fa-star-half-stroke";
  static empty = "fa-regular fa-star";
  static stylesheet = new URL("./rating-stars.css", import.meta.url).href;
  static fontawesome = new URL("/node_modules/@fortawesome/fontawesome-free/css/all.min.css", import.meta.url).href;

  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = "";

    for (let i = 0; i < 5; i++) {
      const newStar = document.createElement("i");
      this.#stars.push(newStar);
      newStar.addEventListener("click", (e) => this.setValue(e, i + 1));
      this.append(newStar);
    }

    this.setValue(null, this.getAttribute("value"));
    this.initStyle();
  }

  setValue(event, newValue) {
    if(event) {
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left + rect.width / 2) {
          newValue -= 0.5;
        }
    }

    if (this.value !== newValue) {
      this.value = newValue;
      this.dispatchEvent(
        new CustomEvent("change", {
          detail: { value: this.value },
          bubbles: true,
          composed: true,
        })
      );
    }

    for (let i = 0; i < this.#stars.length; i++) {
      const star = this.#stars[i];
      if (i < this.value) {
        if (i + 0.5 < this.value) {
          star.className = RatingStars.full;
        } else {
          star.className = RatingStars.half;
        }
      } else {
        star.className = RatingStars.empty;
      }
    }

    this.setAttribute("value", this.value);
  }

  getStylesheet() {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = RatingStars.stylesheet;
    return link;
  }

  getFontawesome() {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = RatingStars.fontawesome;
    return link;
  }

  initStyle() {
    if (!document.querySelector(`[href="${RatingStars.stylesheet}"]`)) {
      document.head.append(this.getStylesheet());
    }
    if (!document.querySelector(`[href="${RatingStars.fontawesome}"]`)) {
      document.head.append(this.getFontawesome());
    }
  }
}

customElements.define("rating-stars", RatingStars);