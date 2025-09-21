import fs from "graceful-fs";
import * as cheerio from "cheerio";
import fetch from "node-fetch";
import { gotScraping } from "got-scraping";
import { getEvomiProxyUrl } from "./proxies.js";

async function getIndeedResults(retries = 0) {
  try {
    const res = await gotScraping({
      url: "https://www.indeed.com/jobs?q=software+engineer&l=Austin%2C+TX&radius=50&start=20",
      proxyUrl: getEvomiProxyUrl(),
    });
    console.log(res.statusCode);
    if (res.statusCode !== 200) {
      throw new Error("Status code not equal to 200");
    }
    return res;
  } catch (err) {
    console.log(err.message);
    if (retries < 10) {
      return getIndeedResults(retries + 1);
    }
  }
}

(async () => {
  await getIndeedResults();
})();
