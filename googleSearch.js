import { gotScraping } from "got-scraping";
import { getStormProxyUrl } from "./proxies.js";
import fs from "graceful-fs";
import * as cheerio from "cheerio";

function jsonify(html) {
  const $ = cheerio.load(html);
  const aTags = $("a");
  const json = [];

  aTags.each((i, aTag) => {
    const href = $(aTag).attr("href");
    const h3 = $(aTag).children("h3");
    const title = h3.text();
    if (!title) return;
    if (!href) return;
    if (title === "More results") return;
    const link = {
      title,
      url: href,
    };
    json.push(link);
  });
  return json;
}

async function scrapeGoogle(query, page, retries = 0) {
  try {
    let q = query.split(" ").join("+");
    let start = (page - 1) * 10;
    const res = await gotScraping({
      url: `https://www.google.com/search?q=${q}&start=${start}`,
      proxyUrl: getStormProxyUrl(),
    });
    if (res.statusCode !== 200) {
      throw new Error("Status code is not 200");
    }
    const html = res.body;
    return jsonify(html);
  } catch (err) {
    console.log(err.message);
    if (retries < 10) {
      console.log("Retrying...");
      return scrapeGoogle(query, page, retries + 1);
    }
  }
}

(async () => {
  console.log(await scrapeGoogle("Ethical hacking", 1));
})();
