import fetch from "node-fetch";
import fs from "graceful-fs";
import { getSmartProxyAgent } from "./proxies.js";

(async () => {
  //   const eventId = "400878160";
  const eventId = "401547539";
  const sport = "football";
  const league = "nfl";
  const res = await fetch(
    `https://site.web.api.espn.com/apis/site/v2/sports/${sport}/${league}/summary?region=us&lang=en&contentorigin=espn&event=${eventId}`,
    {
      Agent: getSmartProxyAgent(),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15",
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
        pragma: "no-cache",
        priority: "u=1, i",
        "sec-ch-ua":
          '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        Referer: "https://www.espn.com/",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: null,
      method: "GET",
    }
  );
  const json = await res.json();
  fs.writeFileSync("test.json", JSON.stringify(json, null, 2));
  console.log(json);
})();
