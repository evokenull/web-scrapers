import { gotScraping } from "got-scraping";
import { getSmartProxyUrl } from "./proxies.js";
import fs from "graceful-fs";
import * as cheerio from "cheerio";

const getIMDBData = async (url, retries = 0) => {
  try {
    const res = await gotScraping({
      url: "https://www.imdb.com/title/tt0120338/",
      proxyUrl: getSmartProxyUrl(),
    });
    if (res.statusCode !== 200) {
      throw new Error("Status code was not 200");
    }
    const $ = cheerio.load(res.body);
    const script = $("script#__NEXT_DATA__").html();
    const json = JSON.parse(script);
    fs.writeFileSync("imdb.json", JSON.stringify(json, null, 2));
    console.log(
      json.props.pageProps.translationContext.i18n.translations.resources
        .common_language_QBJ
    );
  } catch {
    if (retries < 10) {
      console.log("Retrying...");
      getIMDBData(url, retries + 1);
    }
    console.log("res.statusCode", res.statusCode);
  }
};

(async () => {
  await getIMDBData();
})();
