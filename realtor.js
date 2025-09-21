import fetch from "node-fetch";
import { getSmartProxyAgent } from "./proxies.js";
import fs from "graceful-fs";
import jwt from "jsonwebtoken";

const JWT_SECRET = "17ad51b0-08c3-4263-a711-d94477ad7ea3";

const generateToken = () => {
  try {
    const payload = {
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
      sub: "find_a_realtor",
    };

    const token = jwt.sign(payload, JWT_SECRET);

    return token;
  } catch (err) {
    console.error("Error generating tokens:", err);
    throw err;
  }
};

const rawZips = fs.readFileSync("zip_code_database.json", "utf8");
const jsonZips = JSON.parse(rawZips);

async function getRealtorEmails(zip, offset) {
  const token = generateToken();
  const res = await fetch(
    `https://www.realtor.com/realestateagents/api/v3/search?nar_only=1&offset=${offset}&limit=300&postal_code=${zip}&is_postal_search=true&name=&types=agent&sort=recent_activity_high&far_opt_out=false&client_id=FAR2.0&recommendations_count_min=&agent_rating_min=&languages=&agent_type=&price_min=&price_max=&designations=&photo=true`,
    {
      agent: getSmartProxyAgent(),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        accept: "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9",
        authorization: `Bearer ${token}`,
        priority: "u=1, i",
        "sec-ch-ua":
          '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-newrelic-id": "VwEPVF5XGwQHXFNTBAcAUQ==",
        Referer: "https://www.realtor.com/realestateagents/austin_tx",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: null,
      method: "GET",
    }
  );
  const json = await res.json();
  const emails = json.agents.map((agent) => {
    if (!agent.email === null) return;
    return agent.email;
  });
  return emails;
}

async function batchProcess(retries = 0) {
  try {
    jsonZips.data.forEach((zip) => {
      const tasks = [];
      zip = zip[0].padStart(5, "0");

      for (let i = 0; i < 1000; i += 300) {
        if (tasks.length === 100 || tasks.length === jsonZips.data.length - 1) {
          console.log("Pushing tasks to process...");
          tasks.push(getRealtorEmails(zip, i));
          console.log(tasks.length);
        }
      }
      return tasks;
    });
  } catch (err) {
    if (retries < 10) {
      console.log("Retrying batchProcess...");
      await batchProcess(retries + 1);
    }
    console.log("Error at batchProcess:", err.message);
  }
}

(async () => {
  const tasks = await batchProcess();
  const emails = await Promise.all(tasks);
  console.log(emails);
})();
