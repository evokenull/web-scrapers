import puppeteerExtra from "puppeteer-extra";
import fs from "graceful-fs";
import stealthPlugin from "puppeteer-extra-plugin-stealth";
import chromium from "@sparticuz/chromium";
import dotenv from "dotenv";
dotenv.config();

async function runPuppeteer(url, isLocal = true) {
  try {
    puppeteerExtra.use(stealthPlugin());
    let browser;
    if (isLocal) {
      browser = await puppeteerExtra.launch({
        // headless: false,
        headless: "new",
        args: ["--proxy-server=https://dc.smartproxy.com:10000"],
        devtools: true,
        executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
      });
    } else {
      console.log("Not local");
      browser = await puppeteerExtra.launch({
        args: [
          "--proxy-server=http://dc.smartproxy.com:10000",
          ...chromium.args,
        ],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: "new",
        ignoreHTTPSErrors: true,
      });
    }
    const page = await browser.newPage();
    await page.authenticate({
      username: process.env.SMARTPROXY_USER,
      password: process.env.SMARTPROXY_PASS,
    });
    await page.goto(url);

    const responses = [];
    page.on("response", async (response) => {
      const url = response.url();

      if (url?.includes("item_list")) {
        let json = await response.json();
        responses.push(json);
        console.log(responses);
      }
    });

    await new Promise((resolve) => setTimeout(resolve, 3000));
    browser.close();

    return responses;
  } catch (err) {
    console.log(err.message);
    throw new Error(err.message);
  }
}

export const handler = async (event) => {
  try {
    const { url, isLocal } = JSON.parse(event.body);
    const html = await runPuppeteer(url, isLocal);

    return {
      statusCode: 200,
      body: JSON.stringify(html),
    };
  } catch (err) {
    console.log("Error at handler", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message }),
    };
  }
};

const reses = await runPuppeteer(
  "https:/www.tiktok.com/@stoolpresidente",
  true
);

console.log("reses", reses);
fs.writeFileSync("test.json", JSON.stringify(reses, null, 2));
