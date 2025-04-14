"use strict";

import PlatformPrefab from "./Prefabs/platform_prefab.js";

export function CreateAndAppendPlatforms(values, parent) {
    values.forEach((platform) => {
        if (platform.platform_family == null && !platform.name.toLowerCase().includes("ios")) {
          platform.platform_family = -1;
        } else if (platform.name.toLowerCase().includes("linux")) {
          platform.platform_family = 0;
        } else if (platform.platform_family == 4) {
          platform.platform_family = 6;
        }
    });

    values.sort((a, b) => {
        if (a.platform_family !== b.platform_family) {
            return a.platform_family - b.platform_family;
        }
        else return a.generation - b.generation;
    })

  for (let i = 0; i < values.length; i++) {
    const platform = values[i];
    if (platform.abbreviation) {
      const newPrefab = document.createElement("platform-prefab");
      newPrefab.set(platform);
      parent.append(newPrefab);
    }
  }
}
