import got from "cloudflare-scraper";

(async () => {
  try {
    const response = await got.get("https://ipinfo.io/json");
    console.log(response.body);
  } catch (error) {
    console.log(error);
  }
})();
