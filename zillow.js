import fetch from "node-fetch";
import { getSmartProxyAgent } from "./proxies.js";
import * as cheerio from "cheerio";
import fs from "graceful-fs";

async function getSearchResults() {
  const searchQueryState = {
    pagination: {},
    isMapVisible: true,
    mapBounds: {
      west: -85.18142594921878,
      east: -77.58438005078128,
      south: 39.962691741345196,
      north: 41.679364593353036,
    },
    mapZoom: 8,
    usersSearchTerm: "Canton OH",
    regionSelection: [{ regionId: 51260, regionType: 6 }],
    filterState: { sortSelection: { value: "globalrelevanceex" } },
    isListVisible: true,
  };

  const wants = {
    cat1: ["listResults", "mapResults"],
    cat2: ["total"],
  };

  const res = await fetch(
    "https://www.zillow.com/async-create-search-page-state",
    {
      agent: getSmartProxyAgent(),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15",
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "application/json",
        priority: "u=1, i",
        "sec-ch-ua":
          '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        Referer:
          "https://www.zillow.com/canton-oh/?searchQueryState=%7B%22pagination%22%3A%7B%7D%2C%22isMapVisible%22%3Atrue%2C%22mapBounds%22%3A%7B%22west%22%3A-83.2821644746094%2C%22east%22%3A-79.48364152539065%2C%22south%22%3A40.39602267633271%2C%22north%22%3A41.25436520982812%7D%2C%22regionSelection%22%3A%5B%7B%22regionId%22%3A51260%2C%22regionType%22%3A6%7D%5D%2C%22filterState%22%3A%7B%22sort%22%3A%7B%22value%22%3A%22globalrelevanceex%22%7D%7D%2C%22isListVisible%22%3Atrue%2C%22mapZoom%22%3A9%2C%22usersSearchTerm%22%3A%22Canton%20OH%22%7D",
        "Referrer-Policy": "unsafe-url",
      },
      body: JSON.stringify({
        searchQueryState,
        wants,
      }),
      isDebugRequest: false,
      requestId: 3,
      method: "PUT",
    }
  );
  const json = await res.json();
  fs.writeFileSync("test.json", JSON.stringify(json, null, 2));
  //   console.log("mapResults:", json.cat1.searchResults.mapResults.length);
  console.log(
    "listResults",
    json.cat1.searchResults.listResults.map((x) => x.address)
  );
}

async function getListingDetails(zpid) {
  const res = await fetch(
    `https://www.zillow.com/graphql/?extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%227cbd9ac36101393612954f6ba42a32bcf70c46fc407235bc92bb3f2484be18f7%22%7D%7D&variables=%7B%22zpid%22%3A%22${zpid}%22%2C%22zillowPlatform%22%3A%22DESKTOP%22%2C%22altId%22%3Anull%7D`,
    {
      agent: getSmartProxyAgent(),
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15",
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        "client-id": "for-sale-sub-app-browser-client",
        "content-type": "application/json",
        priority: "u=1, i",
        "sec-ch-ua":
          '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        Referer:
          "https://www.zillow.com/homedetails/2355-Moock-Ave-SW-Canton-OH-44706/35275236_zpid/",
        "Referrer-Policy": "unsafe-url",
      },
      body: null,
      method: "GET",
    }
  );
  const json = await res.json();
  fs.writeFileSync("test.json", JSON.stringify(json, null, 2));
  console.log(json);
}

(async () => {
  // await getSearchResults();
  await getListingDetails(35234152);
})();
