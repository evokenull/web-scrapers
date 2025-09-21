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
        headless: false,
        // headless: "new",
        args: ["--proxy-server=http://core-residential.evomi-proxy.com:1000"],
        // devtools: true,
        executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
      });
    } else {
      console.log("Not local");
      browser = await puppeteerExtra.launch({
        args: [
          "--proxy-server=http://core-residential.evomi.com:1000",
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
      username: process.env.EVOMI_USER,
      password: process.env.EVOMI_PASS,
    });

    await page.goto(url);
    // await new Promise((resolve) => setTimeout(resolve, 3000));
    // await page.reload();

    // let scrolls = 0;

    // while (scrolls < 10) {
    //   await page.evaluate(() => {
    //     window.scrollBy(0, window.innerHeight);
    //   });
    //   await new Promise((resolve) => setTimeout(resolve, 500));
    //   scrolls++;
    // }

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const html = await page.content();

    //bug that prevents the page for closing so this is the workaround

    await browser.close();
    console.log("Browser closed");
    return html;
  } catch (err) {
    console.log(err.message);
    throw new Error(err.message);
  }
}

// export const handler = async (event) => {
//   try {
//     const { url, isLocal } = JSON.parse(event.body);
//     const html = await runPuppeteer(url, isLocal);

//     return {
//       statusCode: 200,
//       body: JSON.stringify(html),
//     };
//   } catch (err) {
//     console.log("Error at handler", err.message);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ message: err.message }),
//     };
//   }
// };

runPuppeteer(
  "https://www.cyberbackgroundchecks.com/address/500-sunny-ln/austin/tx",
  true
).then(console.log);
