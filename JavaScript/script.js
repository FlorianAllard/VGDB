// Instantiate headers
const headerFetch = fetch("/HTML/header.html");
let headerHTML = "";
const footerFetch = fetch("/HTML/footer.html");
let footerHTML = "";
Promise.all([headerFetch, footerFetch]).then((responses) => {
  responses[0].text().then((data) => {
    document.body.innerHTML = data + document.body.innerHTML;
  });
  responses[1].text().then((data) => {
    document.body.innerHTML = document.body.innerHTML + data;
  });
});

/**
 *
 * @param {Response} response
 */
function importEssentials(response) {
  if (response.ok) {
    response.text().then((data) => {
      document.body.innerHTML = data + document.body.innerHTML;
    });
  } else {
    console.error(response.statusText);
  }
}

debug_populatePage();
function debug_populatePage() {
  const trendingPortrait = document.querySelector(
    "#trending .card:has(>.portrait)"
  );
  for (let i = 0; i < 3; i++) {
    const clone = trendingPortrait.cloneNode(true);
    trendingPortrait.after(clone);
  }

  const mostAnticipated = document.querySelector("#most-anticipated .card");
  for (let i = 0; i < 4; i++) {
    const clone = mostAnticipated.cloneNode(true);
    mostAnticipated.after(clone);
  }

  const comingSoon = document.querySelector("#coming-soon .card");
  for (let i = 0; i < 6; i++) {
    const clone = comingSoon.cloneNode(true);
    comingSoon.after(clone);
  }

  const userReview = document.querySelector(".user-review");
  for (let i = 0; i < 5; i++) {
    const clone = userReview.cloneNode(true);
    userReview.after(clone);
  }

  const fullRating = document.querySelector(".rating-full");
  for (let i = 0; i < 5; i++) {
    const clone = fullRating.cloneNode(true);
    fullRating.after(clone);
  }
}
