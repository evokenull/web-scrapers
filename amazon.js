import { gotScraping } from "got-scraping";
import fetch from "node-fetch";
import fs from "graceful-fs";
import * as cheerio from "cheerio";
import { getSmartProxyAgent, getSmartProxyUrl } from "./proxies.js";

(async () => {
  //   const res = await fetch(
  //     "https://www.amazon.com/Huffy-Mountain-21-Speed-Hardtail-26-inch/dp/B0CCSM7VNF",
  //     {
  //       agent: getSmartProxyAgent(),
  //       headers: {
  //         "User-Agent": "Googlebot/2.1 (+http://www.google.com/bot.html)",
  //         "device-memory": "8",
  //         downlink: "10",
  //         dpr: "1",
  //         ect: "4g",
  //         rtt: "50",
  //         "sec-ch-device-memory": "8",
  //         "sec-ch-dpr": "1",
  //         "sec-ch-ua":
  //           '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
  //         "sec-ch-ua-mobile": "?0",
  //         "sec-ch-ua-platform": '"Windows"',
  //         "sec-ch-ua-platform-version": '"15.0.0"',
  //         "sec-ch-viewport-width": "1920",
  //         "upgrade-insecure-requests": "1",
  //         "viewport-width": "1920",
  //         Referer:
  //           "https://www.amazon.com/s?k=bikes&crid=BSMXJCFM7JUL&sprefix=bike%2Caps%2C98&ref=nb_sb_noss_1",
  //         "Referrer-Policy": "strict-origin-when-cross-origin",
  //       },
  //       body: null,
  //       method: "GET",
  //     }
  //   );
  //   console.log(res.status);
  //   const html = await res.text();
  //   fs.writeFileSync("test.html", html);
  const res = await gotScraping({
    url: "https://www.amazon.com/Huffy-Mountain-21-Speed-Hardtail-26-inch/dp/B0CCSM7VNF",
    proxyUrl: getSmartProxyUrl(),
  });
  const $ = cheerio.load(res.body);
  const price = $(".a-price > span").first().text();
  const title = $("#productTitle").first().text().trimStart();
  const ratings = $("#acrCustomerReviewText").first().text();
  console.log("Title:", title);
  console.log("Price:", price);
  console.log("Ratings:", ratings);
})();
