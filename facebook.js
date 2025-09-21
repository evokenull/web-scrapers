import { getResidentialSmartProxyUrl } from "./proxies.js";
import { gotScraping } from "got-scraping";
import fs from "graceful-fs";

(async () => {
  const res = await gotScraping({
    url: "https://www.facebook.com/search/groups/?q=solar%20companies&sde=Abo6mQGTwumSH8ghiQqAvvjPX7NFviMO4wSBhxr6grIQwUayjg5k0ye5FNdIS2HCiLkkJOB-TfP5YV29lVJ9zt3H",
    // proxyUrl: getResidentialSmartProxyUrl(),
  });
  fs.writeFileSync("test.html", res.body);
})();
