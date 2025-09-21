import fetch from "node-fetch";
import fs from "graceful-fs";
import { getEvomiProxyAgent } from "./proxies.js";

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

const skools = [];

const getSkools = async (page) => {
  const res = await fetch(
    `https://www.skool.com/_next/data/1740087718348/discovery.json?p=${page}`,
    {
      agent: getEvomiProxyAgent(),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        pragma: "no-cache",
        priority: "u=1, i",
        "sec-ch-ua":
          '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-nextjs-data": "1",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: null,
      method: "GET",
    }
  );
  const json = await res.json();
  let i = 0;

  while (i <= json.pageProps.numGroups) {
    const price = json.pageProps.groups[i].group.metadata.currentMBp
      ? +json.pageProps.groups[i].group.metadata.currentMBp
          .split(":")[2]
          .replace("}", "")
          .trim()
          .slice(0, -2)
      : null;
    if (price === null) {
      i++;
      continue;
    }

    const skool = {
      id: json.pageProps.groups[i].group.id,
      dateCreated: json.pageProps.groups[i].group.createdAt,
      name: json.pageProps.groups[i].group.metadata.displayName,
      description: json.pageProps.groups[i].group.metadata.description
        .trim()
        .split(/\r?\n|\r/g),
      monthlyPrice: price,
      groupType: json.pageProps.groups[i].group.metadata.lpAccessType,
      members: json.pageProps.groups[i].group.metadata.totalMembers,
      rank: json.pageProps.groups[i].rank,
    };
    skools.push(skool);
    console.log(skools);
    i++;
  }
};
const execute = async () => {
  let page = 1;
  while (skools.length < 375) {
    try {
      await getSkools(page);
      await sleep(1000);
      page++;
    } catch (e) {
      console.error(`Error on page ${page}:`, e);
      page++;
    }

    fs.writeFileSync("skools.json", JSON.stringify(skools, null, 2));
  }
};

execute();
