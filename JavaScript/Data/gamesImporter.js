"use strict";

// Importing modules
import * as Utilities from "../utilities_module.js";
import * as IGDB from "../APIs/igdb_api.js";

const rebuildButton = document.querySelector("#rebuild-database");
rebuildButton.addEventListener("click", () => rebuild());
const gamesAmount = 10;
let games = [];

async function rebuild() {
    const dataArray = await IGDB.requestGames("*, game_type.*, genres.*, websites.*, videos.*, collections.*, franchises.*, cover.*, player_perspectives.*, game_modes.*, themes.*, involved_companies.*, involved_companies.company.*, game_engines.*, platforms.*, language_supports.*, language_supports.language.*, language_supports.language_support_type.*, age_ratings.*, age_ratings.content_descriptions.*, age_ratings.organization.*, release_dates.*, release_dates.platform.*, release_dates.release_region.*, release_dates.status.*, external_games.*, dlcs.*, dlcs.cover.*, dlcs.websites.* , expansions.*, expansions.cover.*, expansions.websites.*, artworks.*, screenshots.*, platforms.platform_family.*, platforms.platform_type.*", "id asc", gamesAmount, ``);

    const idsString = `(${dataArray.map(item => item.id).join(", ")})`;
    const versionsArray = await IGDB.requestGames("*, cover.*, websites.*", "", "", `version_parent = ${idsString}`);

    console.log(dataArray[0]);
    console.log(versionsArray[0]);

    const promises = dataArray.map(async (data) => {
      const game = {};

      game.id = data.id;
      game.name = data.name;
      
      game.age_ratings = [];
      if (data.age_ratings) {
        data.age_ratings.forEach((ageRating) => game.age_ratings.push(formatAgeRating(ageRating)));
      }
        
      
      game.category = data.game_type.type;
      
      game.cover = data.cover ? await formatCover(data) : undefined;
      
      game.related_content = {} ;
      if (data.dlcs) {
        game.related_content.dlcs = await Promise.all(
          data.dlcs.map(async (dlcData) => {
            const dlc = {};
            dlc.id = dlcData.id;
            dlc.name = dlcData.name;
            dlc.cover = dlcData.cover ? await formatCover(dlcData) : undefined;
            return dlc;
          })
        );
      }
      if (data.expansions) {
        game.related_content.expansions = await Promise.all(
          data.expansions.map(async (expansionData) => {
            const expansion = {};
            expansion.id = expansionData.id;
            expansion.name = expansionData.name;
            expansion.cover = expansionData.cover ? await formatCover(expansionData) : undefined;
            return expansion;
          })
        );
      }
          
    let editions = versionsArray.filter(edition => edition.version_parent === game.id);
    if (editions.length > 0){
      game.related_content.editions = await Promise.all(
        editions.map(async (editionData) => {
          const edition = {};
          edition.id = editionData.id;
          edition.name = editionData.name;
          edition.cover = editionData.cover ? await formatCover(editionData) : undefined;
          return edition;
        })
      );
    }

      game.release_date = Utilities.dateFromUnix(data.first_release_date);

      game.franchises = data.franchises
      ? data.franchises.map((franchiseData) => {
        const franchise = {};
        franchise.id = franchiseData.id;
        franchise.name = franchiseData.name;
        return franchise;
      })
      : undefined;

      game.game_engines = data.game_engines
        ? data.game_engines.map((d) => {
            const e = {};
            e.id = d.id;
            e.name = d.name;
            return e;
          })
        : undefined;

      game.game_modes = data.game_modes
        ? data.game_modes.map((d) => {
            const e = {};
            e.id = d.id;
            e.name = d.name;
            return e;
          })
        : undefined;

      game.genres = data.genres
        ? data.genres.map((d) => {
            const e = {};
            e.id = d.id;
            e.name = d.name;
            return e;
          })
        : undefined;
      
        game.hype = data.hypes;

        game.involved_companies = {};
        if (data.involved_companies) {
          game.involved_companies.developers = [];
          game.involved_companies.supporting = [];
          game.involved_companies.publishers = [];

          data.involved_companies.forEach((companyData) => {
            const company = {
              id: companyData.company.id,
              name: companyData.company.name,
            };
            if (companyData.developer) {
              game.involved_companies.developers.push(company);
            } else if (companyData.supporting) {
              game.involved_companies.supporting.push(company);
            } else if (companyData.publisher) {
              game.involved_companies.publishers.push(company);
          }});
        }

        game.media = {};
        if(data.artworks) {
          game.media.artworks = data.artworks.map((d) => {
            const e = {};
            e.url = `https://images.igdb.com/igdb/image/upload/t_1080p/${d.image_id}.webp`;
            return e;
          });
        }
        if(data.screenshots) {
          game.media.screenshots = data.screenshots.map((d) => {
            const e = {};
            e.url = `https://images.igdb.com/igdb/image/upload/t_1080p/${d.image_id}.webp`;
            return e;
          });
        }
        if(data.videos) {
          game.media.videos = data.videos.map((d) => {
            const e = {};
            e.url = `https://www.youtube.com/embed/${d.video_id}`;
            e.title = d.name;
            e.thumbnail = Utilities.getVideoThumbnail(d.video_id);
            return e;
          });
        }

        game.platforms = [];
        if(data.platforms) {
          game.platforms = data.platforms.map((d) => {
            const e = {};
            e.name = d.name;
            e.family = d.platform_family?.name;
            e.generation = d.generation;
            e.type = d.platform_type?.name;
            return e;
          });
          game.platforms.sort((a, b) => {
            // Sort by family name (nulls last)
            if (a.family && b.family) {
              const familyCompare = a.family.localeCompare(b.family);
              if (familyCompare !== 0) return familyCompare;
            } else if (a.family && !b.family) {
              return 1;
            } else if (!a.family && b.family) {
              return -1;
            }
            // Then by generation (nulls last)
            if (a.generation != null && b.generation != null) {
              return a.generation - b.generation;
            } else if (a.generation != null) {
              return -1;
            } else if (b.generation != null) {
              return 1;
            }
            return 0;
          });
        }

        game.player_perspectives = data.player_perspectives
          ? data.player_perspectives.map((d) => {
              const e = {};
              e.id = d.id;
              e.name = d.name;
              return e;
            })
          : undefined;

        game.releases = [];
        if(data.release_dates) {
          game.releases = formatReleases(data.release_dates);
          game.releases.sort((a,b) => a.date - b.date);
          game.releases.forEach(release => release.date = Utilities.dateFromUnix(release.date));
        }

        game.story = data.storyline;

        game.summary = data.summary;

        game.themes = data.themes
          ? data.themes.map((d) => {
              const e = {};
              e.id = d.id;
              e.name = d.name;
              return e;
            })
          : undefined;
          
          game.external_links = [];
          if (data.websites) {
            game.external_links = formatWebsites(data.websites);
        }

        game.language_supports = [];
        if(data.language_supports) {
          game.language_supports = formatLanguages(data.language_supports);
        }
        
        game.series = data.collections
          ? data.collections.map((d) => {
              const e = {};
              e.id = d.id;
              e.name = d.name;
              return e;
            })
          : undefined;

      return game;
    });

    games = await Promise.all(promises);
    exportToJson();
    console.log(games);
}

function exportToJson() {
  const str = JSON.stringify(games, null, 2);
  const blob = new Blob([str], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "games.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function formatAgeRating(ageRating) {
    const getCountryFromRating = (rating) => {
      const countries = {
        ESRB: "USA & Canada",
        PEGI: "Europe",
        CERO: "Japan",
        USK: "Germany",
        GRAC: "South Korea",
        CLASS_IND: "Brazil",
        ACB: "Australia",
      };
      return countries[rating] || "Unknown";
    };

    return {
      country: getCountryFromRating(ageRating.organization.name),
      organization: ageRating.organization.name,
      rating: ageRating.rating,
      logo_url: `/Assets/Age ratings/${ageRating.rating}.svg`,
      descriptions: ageRating.content_descriptions?.map((e) => e.description),
    };
}

async function formatCover(data) {
    const getImage = (id, format) => {
        switch (format) {
          case "landscape":
            return `https://images.igdb.com/igdb/image/upload/t_screenshot_big/${id}.webp`;
          case "portrait":
            return `https://images.igdb.com/igdb/image/upload/t_cover_big/${id}.webp`;
          case "hero":
            return `https://images.igdb.com/igdb/image/upload/t_1080p/${id}.webp`;
          default:
            break;
        }
      }

  let cover = null;
  if (data) {
    cover = {
      landscape: getImage(data.cover.image_id, "hero"),
      portrait: getImage(data.cover.image_id, "portrait"),
      hero: "",
      logo: ""
    };

    const steamUrl = data.websites?.find((website) => website.url.includes("steam"));
    const match = steamUrl ? steamUrl.url.match(/\/app\/(\d+)/) : undefined;

    if (match) {
        const landscapeUrl = `https://steamcdn-a.akamaihd.net/steam/apps/${match[1]}/header.jpg`;
        const portraitUrl = `https://steamcdn-a.akamaihd.net/steam/apps/${match[1]}/library_600x900_2x.jpg`;
        const heroUrl = `https://steamcdn-a.akamaihd.net/steam/apps/${match[1]}/library_hero.jpg`;
        const logoUrl = `https://steamcdn-a.akamaihd.net/steam/apps/${match[1]}/logo.png`;
        const [landscapeExists, portraitExists, heroExists, logoExists] = await Promise.all([
            Utilities.imageExists(landscapeUrl),
            Utilities.imageExists(portraitUrl),
            Utilities.imageExists(heroUrl),
            Utilities.imageExists(logoUrl)
        ]);
        if (landscapeExists) cover.landscape = landscapeUrl; 
        if (portraitExists) cover.portrait = portraitUrl; 
        if (heroExists) cover.hero = heroUrl; 
        if (logoExists) cover.logo = logoUrl; 
    }
  }
  
  return cover;
}

function formatReleases(releases) {
  const formattedReleases = [];

  releases.forEach((release) => {
    let existingRelease = formattedReleases.find(
      (e) => e.date === release.date && e.release === (release.status?.name || "Full Release")
    );

    if (existingRelease) {
      let platformGroup = existingRelease.platforms.find(
        (p) =>
          p.names.includes(release.platform.name) ||
          p.regions.includes(Utilities.capitalize(release.release_region.region))
      );

      if (platformGroup) {
        if (!platformGroup.names.includes(release.platform.name)) {
          platformGroup.names.push(release.platform.name);
        }
        if (!platformGroup.regions.includes(Utilities.capitalize(release.release_region.region))) {
          platformGroup.regions.push(Utilities.capitalize(release.release_region.region));
        }
      } else {
        existingRelease.platforms.push({
          names: [release.platform.name],
          regions: [Utilities.capitalize(release.release_region.region)],
        });
      }
    } else {
      formattedReleases.push({
        date: release.date,
        release: release.status?.name || "Full Release",
        platforms: [
          {
            names: [release.platform.name],
            regions: [Utilities.capitalize(release.release_region.region)],
          },
        ],
      });
    }
  });

  formattedReleases.forEach((release) => {
    release.platforms.forEach((platform) => {
      platform.names.sort((a, b) => a.localeCompare(b));
    });
    release.platforms.sort((a, b) => a.names[0].localeCompare(b.names[0]));
  });

  formattedReleases.sort((a, b) => a.date - b.date);

  return formattedReleases;
}

function formatWebsites(websites) {
  const getWebsiteFromUrl = (url) => {
    const sites = [
      { keyword: "gog", site: "GOG", color: "#B001DF", icon: "/Assets/Sites/gog.svg" },
      { keyword: "twitter", site: "Twitter", color: "#000000", icon: "/Assets/Sites/twitter.svg" },
      { keyword: "x.com", site: "Twitter", color: "#000000", icon: "/Assets/Sites/twitter.svg" },
      { keyword: "steam", site: "Steam", color: "#12366A", icon: "/Assets/Sites/steam.svg" },
      { keyword: "twitch", site: "Twitch", color: "#A441F7", icon: "/Assets/Sites/twitch.svg" },
      { keyword: "wikipedia", site: "Wikipedia", color: "#E7E7E7", icon: "/Assets/Sites/wikipedia.svg" },
      { keyword: "reddit", site: "Reddit", color: "#F74300", icon: "/Assets/Sites/reddit.svg" },
      { keyword: "youtube", site: "YouTube", color: "#F70000", icon: "/Assets/Sites/youtube.svg" },
      { keyword: "facebook", site: "Facebook", color: "#2F8CF7", icon: "/Assets/Sites/facebook.svg" },
      { keyword: "instagram", site: "Instagram", color: "#C7507C", icon: "/Assets/Sites/instagram.svg" },
      { keyword: "discord", site: "Discord", color: "#4E63EF", icon: "/Assets/Sites/discord.svg" },
      { keyword: "apps.apple", site: "Apple App Store", color: "#1B97F0", icon: "/Assets/Sites/apple.svg" },
      { keyword: "play.google", site: "Google Play", color: "#167B36", icon: "/Assets/Sites/google.svg" },
      { keyword: "epic", site: "Epic Games Store", color: "#2B292A", icon: "/Assets/Sites/epic.svg" },
      { keyword: "bsky", site: "Epic Games Store", color: "#1081F6", icon: "/Assets/Sites/bluesky.svg" },
      { keyword: "wiki", site: "Game wiki", color: "#F20057", icon: "/Assets/Sites/wiki.svg" },
      { keyword: "microsoft", site: "Microsoft Store", color: "#F20057", icon: "/Assets/Sites/microsoft-store.svg" },
    ];
  
    const site = sites.find((s) => url.toLowerCase().includes(s.keyword));
    return site
      ? { url, site: site.site, color: site.color, icon: site.icon }
      : { url, site: "", color: "#E6E6E6", icon: "/Assets/Sites/link.svg" };
  }
  return websites.map((wb) => getWebsiteFromUrl(wb.url));
}

function formatLanguages(languages) {
  const newLanguages = [];

  languages.forEach((supp) => {
    let language = newLanguages.find((e) => e.language.name === supp.language.name);
    if (!language) {
      language = {
        language: supp.language,
        audio: supp.language_support_type === "Audio",
        subtitles: supp.language_support_type === "Subtitles",
        interface: supp.language_support_type === "Interface",
      };
      newLanguages.push(language);
    }
    language.audio ||= supp.language_support_type.name === "Audio";
    language.subtitles ||= supp.language_support_type.name === "Subtitles";
    language.interface ||= supp.language_support_type.name === "Interface";
  });

  return newLanguages.sort((a, b) => a.language.name.localeCompare(b.language.name));
}
