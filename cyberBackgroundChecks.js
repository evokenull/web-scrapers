import { gotScraping } from "got-scraping";
import { getEvomiProxyUrl } from "./proxies.js";

async function getCyberBackgroundCheck(retries = 0) {
  try {
    const res = await gotScraping({
      url: "https://www.cyberbackgroundchecks.com/address/500-sunny-ln/austin/tx",
      proxyUrl: getEvomiProxyUrl(),
    });

    if (res.statusCode !== 200) throw new Error("Status code not equal to 200");
    console.log(res.statusCode);
  } catch (err) {
    console.log(err.message);
    if (retries < 30) {
      return getCyberBackgroundCheck(retries + 1);
    }
  }
}

(async () => {
  await getCyberBackgroundCheck();
})();
