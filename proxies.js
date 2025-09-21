import HttpsProxyAgent from "https-proxy-agent";
import fetch from "node-fetch";
import { gotScraping } from "got-scraping";
import dotenv from "dotenv";
dotenv.config();

// Database Smart Proxy
///////////////////////////////////////////////
export function getSmartProxyAgent() {
  const proxyAgent = new HttpsProxyAgent({
    host: "dc.smartproxy.com",
    port: 10000,
    auth: `${process.env.SMARTPROXY_USER}:${process.env.SMARTPROXY_PASS}`,
  });
  return proxyAgent;
}

export function getSmartProxyUrl() {
  return `http://${process.env.SMARTPROXY_USER}:${process.env.SMARTPROXY_PASS}@dc.smartproxy.com:10000`;
}

//Residential Smart Proxy
///////////////////////////////////////////////
export function getResidentialSmartProxyAgent() {
  const proxyAgent = new HttpsProxyAgent({
    host: "gate.smartproxy.com",
    port: 10000,
    auth: `${process.env.SMARTPROXY_RESIDENTIAL_USER}:${process.env.SMARTPROXY_RESIDENTIAL_PASS}`,
  });
  return proxyAgent;
}

export function getResidentialSmartProxyUrl() {
  return `http://${process.env.SMARTPROXY_RESIDENTIAL_USER}:${process.env.SMARTPROXY_RESIDENTIAL_PASS}@gate.smartproxy.com:10000`;
}
//Mobile Storm Proxy
///////////////////////////////////////////////

export function getMobileSmartProxyAgent() {
  const proxyAgent = new HttpsProxyAgent({
    host: "gate.smartproxy.com",
    port: 10000,
    auth: `${process.env.SMARTPROXY_MOBILE_USER}:${process.env.SMARTPROXY_MOBILE_PASS}`,
  });
  return proxyAgent;
}

export function getMobileSmartProxyUrl() {
  return `http://${process.env.SMARTPROXY_MOBILE_USER}:${process.env.SMARTPROXY_MOBILE_PASS}@gate.smartproxy.com:10000`;
}

//Database Storm Proxy
///////////////////////////////////////////////
export function getStormProxyAgent() {
  const proxyAgent = new HttpsProxyAgent({
    host: "5.79.66.2",
    port: 13010,
  });
  return proxyAgent;
}

export function getStormProxyUrl() {
  return `http://5.79.66.2:13010`;
}
//Evomi Residential
///////////////////////////////////////////////
export function getEvomiProxyAgent() {
  const proxyAgent = new HttpsProxyAgent({
    host: "core-residential.evomi.com",
    port: 1000,
    auth: `${process.env.EVOMI_USER}:${process.env.EVOMI_PASS}`,
  });
  return proxyAgent;
}

export function getEvomiProxyUrl() {
  return `http://${process.env.EVOMI_USER}:${process.env.EVOMI_PASS}@core-residential.evomi.com:1000`;
}

// (async () => {
//   const fetchRes = await fetch("https://ipinfo.io/json", {
//     agent: getEvomiProxyAgent(),
//     // agent: getEvomiProxyAgent(),
//   });
//   const fetchJson = await fetchRes.json();
//   console.log("fetchJSON", fetchJson);

//   // const gotScrapingRes = await gotScraping({
//   //   url: "https://ipinfo.io/json",
//   //   responseType: "json",
//   //   // proxyUrl: getEvomiProxyUrl(),
//   // });
//   // console.log("gotScrapingRes.body", gotScrapingRes.body);
// })();
