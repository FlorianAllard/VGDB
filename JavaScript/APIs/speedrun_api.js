import * as Utilities from "../utilities_module.js";

export async function getWorldRecord(name) {
  debugger;
  const speedrunData = await Utilities.getObjectFromUrl(`https://www.speedrun.com/api/v1/games?name=${name.replace(/-/g, "_")}`);
  if (speedrunData.data?.length > 0) {
    const recordLink = speedrunData.data[0].links.find((link) => link.rel === "records");
    const recordData = await Utilities.getObjectFromUrl(recordLink?.uri);
    if (recordData.data?.length > 0 && recordData.data[0].runs?.length > 0) {
      return recordData.data[0].runs[0].run.times.primary_t;
    }
  }

  return undefined;
}
