import fetch from "node-fetch";
import fs from "graceful-fs";
import { getEvomiProxyAgent } from "./proxies.js";

const categories = [
  { id: "8a7678583d3246a1a1a0a4a994321146", name: "🎨 Hobbies" },
  { id: "f08071afbd9746b6adb83522451cd280", name: "🎸 Music" },
  { id: "2830789533b448d8812e7d5d661d776c", name: "💰 Money" },
  { id: "ce77e1a8d5824d8497921368a9328dc0", name: "🙏 Spirituality" },
  { id: "b1dae7402dda47a0b7aa51334474a158", name: "💻 Tech" },
  { id: "e85018a1df484d5ea09c43c8b2764586", name: "🥕 Health" },
  { id: "ca063c42092041d5a8f48dd1903a1f3b", name: "⚽ Sports" },
  { id: "5c00cc7aee1048588759b5504380917a", name: "📚 Self-improvement" },
  { id: "fd915e5fee4a496db1c82c527a33ef09", name: "❤️ Relationships" },
];

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

/**
 * Helper: fetch JSON from a URL.
 */
const fetchJSON = async (url) => {
  try {
    const res = await fetch(url, {
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
      method: "GET",
    });
    return await res.json();
  } catch (err) {
    console.error(`Error fetching ${url}:`, err);
    return null;
  }
};

/**
 * Parse group data into a uniform object.
 * Returns null if no monthlyPrice is available.
 * If categoryName is provided, assigns that category.
 */
const parseGroup = (groupData, categoryName = null) => {
  const group = groupData.group;
  const price = group.metadata.currentMBp
    ? +group.metadata.currentMBp
        .split(":")[2]
        .replace("}", "")
        .trim()
        .slice(0, -2)
    : null;
  if (price === null) return null; // ignore groups without monthlyPrice

  const result = {
    id: group.id,
    dateCreated: group.createdAt,
    name: group.metadata.displayName,
    description: group.metadata.description.trim().split(/\r?\n|\r/g),
    monthlyPrice: price,
    groupType: group.metadata.lpAccessType,
    members: group.metadata.totalMembers,
    rank: groupData.rank,
  };
  if (categoryName) {
    result.category = categoryName;
  }
  return result;
};

/**
 * Fetch uncategorized groups (all pages).
 */
const getAllSkools = async () => {
  let page = 1;
  const allSkools = [];
  while (true) {
    const url = `https://www.skool.com/_next/data/1740087718348/discovery.json?p=${page}`;
    const json = await fetchJSON(url);
    if (!json || !json.pageProps?.groups || json.pageProps.groups.length === 0)
      break;

    json.pageProps.groups.forEach((groupData) => {
      const parsed = parseGroup(groupData);
      if (parsed) {
        allSkools.push(parsed);
      }
    });
    console.log(`Fetched uncategorized page ${page}`);
    page++;
    await sleep(1000);
  }
  return allSkools;
};

/**
 * Fetch groups for a given category (all pages).
 */
const getSkoolsByCategory = async (catId, catName) => {
  let page = 1;
  const categorizedSkools = [];
  while (true) {
    const url = `https://www.skool.com/_next/data/1740087718348/discovery.json?c=${catId}&p=${page}`;
    const json = await fetchJSON(url);
    if (!json || !json.pageProps?.groups || json.pageProps.groups.length === 0)
      break;

    json.pageProps.groups.forEach((groupData) => {
      const parsed = parseGroup(groupData, catName);
      if (parsed) {
        categorizedSkools.push(parsed);
      }
    });
    console.log(`Fetched category "${catName}" page ${page}`);
    page++;
    await sleep(1000);
  }
  return categorizedSkools;
};

/**
 * Merge categorized and uncategorized groups:
 * 1. First, fetch all categorized groups across all categories.
 * 2. Then, fetch all uncategorized groups.
 * 3. For groups that appear in both, use the categorized version.
 * 4. Groups that only appear in one set are still included.
 */
const mergeSkools = async () => {
  // Step 1: Fetch categorized groups (each with its own category).
  const categorizedMap = new Map();
  for (const cat of categories) {
    const catGroups = await getSkoolsByCategory(cat.id, cat.name);
    for (const group of catGroups) {
      if (categorizedMap.has(group.id)) {
        // Shouldn't happen if each group belongs to only one category.
        const existing = categorizedMap.get(group.id);
        if (existing.category !== group.category) {
          console.warn(
            `Group ${group.id} appears with multiple categories: ${existing.category} vs ${group.category}. Keeping the first one.`
          );
        }
      } else {
        categorizedMap.set(group.id, group);
      }
    }
  }

  // Step 2: Fetch uncategorized groups.
  const uncategorized = await getAllSkools();
  const finalMap = new Map();

  // Add all uncategorized groups.
  for (const group of uncategorized) {
    finalMap.set(group.id, group);
  }

  // Override (or add) with categorized groups.
  for (const [id, catGroup] of categorizedMap.entries()) {
    finalMap.set(id, catGroup);
  }

  return Array.from(finalMap.values());
};

(async () => {
  const mergedSkools = await mergeSkools();
  fs.writeFileSync("skools_final.json", JSON.stringify(mergedSkools, null, 2));
  console.log(
    `Merged results written to skools_final.json. Total items: ${mergedSkools.length}`
  );
})();
