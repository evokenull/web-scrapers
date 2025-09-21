import fetch from "node-fetch";
import { getSmartProxyAgent, getMobileSmartProxyUrl } from "./proxies.js";
import { gotScraping } from "got-scraping";
import * as cheerio from "cheerio";
import fs from "graceful-fs";

// Function to recursively search for the key
function findKey(obj, keyToFind) {
  try {
    if (obj.hasOwnProperty(keyToFind)) {
      return obj[keyToFind];
    }

    for (let key in obj) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        let result = findKey(obj[key], keyToFind);
        if (result !== undefined) {
          return result;
        }
      }
    }

    return undefined;
  } catch (error) {
    console.log("error at findKey", error.message);
    console.log("keyToFind", keyToFind);
  }
}

function searchForValueIncluding(obj, searchString) {
  try {
    if (Array.isArray(obj)) {
      for (let item of obj) {
        if (Array.isArray(item) && item[0] === searchString) {
          return obj;
        } else if (typeof item === "object" && item !== null) {
          let result = searchForValueIncluding(item, searchString);
          if (result) {
            return result;
          }
        }
      }
    } else if (typeof obj === "object" && obj !== null) {
      for (let key in obj) {
        let result = searchForValueIncluding(obj[key], searchString);
        if (result) {
          return result;
        }
      }
    }

    return undefined;
  } catch (error) {
    console.log("error at searchForValueIncluding", error.message);
    console.log("searchString", searchString);
  }
}

function getProps(html) {
  try {
    const $ = cheerio.load(html);
    // find the script tag that includes CountryNamesConfig
    let scriptIWant;
    $("script").each((i, elem) => {
      if ($(elem).html().includes("CountryNamesConfig")) {
        scriptIWant = $(elem).html();
      }
    });
    // parse the script tag
    const scriptJSON = JSON.parse(scriptIWant);

    const nestedContentRoot = searchForValueIncluding(
      scriptJSON,
      "PolarisProfileNestedContentRoot.react"
    );

    const props = findKey(nestedContentRoot, "props");
    return props;
  } catch (error) {
    console.log("error at getProps", error.message);
  }
}

async function getLsdAndUserId(handle) {
  try {
    const res = await gotScraping({
      url: `https://www.instagram.com/${handle}`,
      proxyUrl: getMobileSmartProxyUrl(),
    });
    const $ = cheerio.load(res.body);
    const script = $("script#__eqmc").html();
    const json = JSON.parse(script);
    const lsd = json?.l;
    fs.writeFileSync("test.html", res.body);
    const props = getProps(res.body);
    return {
      lsd,
      userId: props?.id,
    };
  } catch (err) {
    console.log("error at getLsdAndUserId", err.message);
  }
}

async function getIGProfileWithId(handle) {
  const { lsd, userId } = await getLsdAndUserId(handle);
  const res = await fetch("https://www.instagram.com/graphql/query", {
    agent: getSmartProxyAgent(),
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      accept: "*/*",
      "accept-language": "en-US,en;q=0.9",
      "content-type": "application/x-www-form-urlencoded",
      priority: "u=1, i",
      "sec-ch-prefers-color-scheme": "dark",
      "sec-ch-ua":
        '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
      "sec-ch-ua-full-version-list":
        '"Google Chrome";v="131.0.6778.205", "Chromium";v="131.0.6778.205", "Not_A Brand";v="24.0.0.0"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-model": '""',
      "sec-ch-ua-platform": '"Windows"',
      "sec-ch-ua-platform-version": '"15.0.0"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-asbd-id": "129477",
      "x-bloks-version-id":
        "abaff5d09a530689e609e838538ae53475ff0cac083a548efad6633e0e625cff",
      "x-csrftoken": "DILVCr3pfWN7MrPKUdXP1q",
      "x-fb-friendly-name": "PolarisProfilePageContentQuery",
      "x-fb-lsd": lsd,
      "x-ig-app-id": "936619743392459",
      Referer: "https://www.instagram.com/adrianhorning/",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
    body: `av=0&__d=www&__user=0&__a=1&__req=3&__hs=20085.HYP%3Ainstagram_web_pkg.2.1.0.0.0&dpr=1&__ccg=EXCELLENT&__rev=1019092933&__s=xvvqcy%3Ahhb68l%3Al6h9xn&__hsi=7453496623003279462&__dyn=7xe5WwlEnwn8K2Wmm1twpUnwgU7S6EeUaUco38w5ux609vCwjE1EE2Cw8G11w6zx62G3i1ywOwa90Fw4Hw9O0M82zxe2GewGw9a361qw8W5U4q08HwSyES1Twoob82ZwrUdUbGw4mwr86C1mwrd6goK10xKi2qi7E5yqcwhU34DG8ByUC&__csr=&__comet_req=7&lsd=${lsd}&jazoest=2999&__spin_r=1019092933&__spin_b=trunk&__spin_t=1735402416&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=PolarisProfilePageContentQuery&variables=%7B%22id%22%3A%22${userId}%22%2C%22render_surface%22%3A%22PROFILE%22%7D&server_timestamps=true&doc_id=8755478011231574`,
    method: "POST",
  });
  return res;
}

async function getIgProfileWithHandle(handle) {
  try {
    const userAgents = JSON.parse(fs.readFileSync("./iosUserAgents.json"));
    const randomIndex = Math.floor(Math.random() * userAgents.length);
    const userAgent = userAgents[randomIndex];
    const res = await gotScraping({
      url: `https://i.instagram.com/api/v1/users/web_profile_info/?username=${handle}`,
      proxyUrl: getMobileSmartProxyUrl(),
      responseType: "json",
      headers: {
        "User-Agent": userAgent,
        "x-ig-app-id": "936619743392459",
      },
    });
    return res;
  } catch (err) {
    console.log(err.message);
  }
}

(async () => {
  const res = await getIgProfileWithHandle("adrianhorning");
  console.log(res.body);
  fs.writeFileSync("test.json", JSON.stringify(res.body, null, 2));
})();
