import fetch from "node-fetch";
import fs from "graceful-fs";
import axios from "axios";
import { getSmartProxyAgent } from "./proxies.js";

function prepare(input) {
  // There are 5 random characters before the JSON object we need to remove
  // Also I found that the newlines were messing up the JSON parsing,
  // so I removed those and it worked.
  const preparedForParsing = input.substring(5).replace(/\n/g, "");
  const json = JSON.parse(preparedForParsing);
  const results = json[0][1].map((array) => array[14]);
  return results;
}

function prepareLookup(data) {
  // this function takes a list of indexes as arguments
  // constructs them into a line of code and then
  // execs the retrieval in a try/catch to handle data not being present
  return function lookup(...indexes) {
    const indexesWithBrackets = indexes.reduce(
      (acc, cur) => `${acc}[${cur}]`,
      ""
    );
    const cmd = `data${indexesWithBrackets}`;
    try {
      const result = eval(cmd);
      return result;
    } catch (e) {
      return null;
    }
  };
}

function buildResults(preparedData) {
  const results = [];
  for (const place of preparedData) {
    const lookup = prepareLookup(place);

    // Use the indexes below to extract certain pieces of data
    // or as a starting point of exploring the data response.
    const result = {
      address: {
        street_address: lookup(183, 1, 2),
        city: lookup(183, 1, 3),
        zip: lookup(183, 1, 4),
        state: lookup(183, 1, 5),
        country_code: lookup(183, 1, 6),
      },
      name: lookup(11),
      tags: lookup(13),
      notes: lookup(25, 15, 0, 2) || "No notes!",
      placeId: lookup(78),
      phone: lookup(178, 0, 0),
      coordinates: {
        long: lookup(208, 0, 2),
        lat: lookup(208, 0, 3),
      },
    };
    if (!result.placeId) continue;
    results.push(result);
  }

  return results;
}

async function googleMapsTextSearch(query) {
  try {
    const res = await axios({
      method: "get",
      url: `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        query
      )}&key=AIzaSyBs6bgVkAjKgPelvrihQwWz3sB2nbAQjAU`,
    });
    return res?.data?.results?.[0];
  } catch (err) {
    console.log("error at googleMapsTextSearch", err.message);
  }
}

function getLongLatList(place, desiredGridLength = 5) {
  const northeastLat = place?.geometry.viewport.northeast.lat;
  const northeastLng = place?.geometry.viewport.northeast.lng;
  const southwestLat = place?.geometry.viewport.southwest.lat;
  const southwestLng = place?.geometry.viewport.southwest.lng;

  // console.log(northeastLat, northeastLng, southwestLat, southwestLng);

  let output = [];
  let epsilon = 0.000001;
  let intermediate_grid_length = desiredGridLength - 1;

  let lat_step_size = (northeastLat - southwestLat) / intermediate_grid_length;
  let lng_step_size = (northeastLng - southwestLng) / intermediate_grid_length;

  for (
    let lat = southwestLat;
    lat <= northeastLat + epsilon;
    lat += lat_step_size
  ) {
    for (
      let lng = southwestLng;
      lng <= northeastLng + epsilon;
      lng += lng_step_size
    ) {
      output.push([lat, lng]);
    }
  }
  return output;
}

async function getGoogleMapsData(q, lat, long, zoom, limit, start) {
  try {
    const res = await fetch(
      `https://www.google.com/search?tbm=map&authuser=0&hl=en&gl=ca&pb=!4m12!1m3!1d${zoom}!2d${long}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1064!2i604!4f35!7i${limit}!8i${start}!10b1!12m22!1m3!18b1!30b1!34e1!2m3!5m1!6e2!20e3!10b1!12b1!13b1!16b1!17m1!3e1!20m3!5e2!6b1!14b1!46m1!1b0!94b1!96b1!19m4!2m3!1i360!2i120!4i8!20m48!2m2!1i203!2i100!3m2!2i4!5b1!6m6!1m2!1i86!2i86!1m2!1i408!2i240!7m33!1m3!1e1!2b0!3e3!1m3!1e2!2b1!3e2!1m3!1e2!2b0!3e3!1m3!1e8!2b0!3e3!1m3!1e10!2b0!3e3!1m3!1e10!2b1!3e2!1m3!1e10!2b0!3e4!1m3!1e9!2b1!3e2!2b1!9b0!22m6!1sZJBtZ6uTJbLl5NoPs6KS6Qs%3A1!2s1i%3A0%2Ct%3A11886%2Cp%3AZJBtZ6uTJbLl5NoPs6KS6Qs%3A1!7e81!12e5!17sZJBtZ6uTJbLl5NoPs6KS6Qs%3A522!18e15!24m105!1m32!13m9!2b1!3b1!4b1!6i1!8b1!9b1!14b1!20b1!25b1!18m21!3b1!4b1!5b1!6b1!9b1!12b1!13b1!14b1!17b1!20b1!21b1!22b1!25b1!27m1!1b0!28b0!32b0!33m1!1b1!34b0!36e1!10m1!8e3!11m1!3e1!14m1!3b1!17b1!20m2!1e3!1e6!24b1!25b1!26b1!29b1!30m1!2b1!36b1!39m3!2m2!2i1!3i1!43b1!52b1!54m1!1b1!55b1!56m1!1b1!65m5!3m4!1m3!1m2!1i224!2i298!71b1!72m19!1m5!1b1!2b1!3b1!5b1!7b1!4b1!8m10!1m6!4m1!1e1!4m1!1e3!4m1!1e4!3sother_user_reviews!6m1!1e1!9b1!89b1!98m3!1b1!2b1!3b1!103b1!113b1!114m3!1b1!2m1!1b1!117b1!122m1!1b1!125b0!126b1!127b1!26m4!2m3!1i80!2i92!4i8!30m28!1m6!1m2!1i0!2i0!2m2!1i530!2i604!1m6!1m2!1i1014!2i0!2m2!1i1064!2i604!1m6!1m2!1i0!2i0!2m2!1i1064!2i20!1m6!1m2!1i0!2i584!2m2!1i1064!2i604!34m18!2b1!3b1!4b1!6b1!8m6!1b1!3b1!4b1!5b1!6b1!7b1!9b1!12b1!14b1!20b1!23b1!25b1!26b1!37m1!1e81!42b1!47m0!49m9!3b1!6m2!1b1!2b1!7m2!1e3!2b1!8b1!9b1!50m4!2e2!3m2!1b1!3b1!67m2!7b1!10b1!69i715&q=${encodeURIComponent(
        q
      )}&gs_l=maps.3..38i377k1j38i72k1l4.3032614.3033964.4.3034069.15.15.....172.665.7j1.8.....0....1..maps..7.8.719.0..38i377i430i444k1j38i377i430i426k1j38i39i111i444k1j38i39i129k1j38i39i129i376k1j38i376k1j38i39i128k1j38i426k1j38i39i111i426k1j38i429k1j38i459k1j38i10i377k1.&tch=1&ech=4&psi=ZJBtZ6uTJbLl5NoPs6KS6Qs.1735233637276.1`,
      {
        agent: getSmartProxyAgent(),
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          accept: "*/*",
          "accept-language": "en-US,en;q=0.9",
          "cache-control": "no-cache",
          pragma: "no-cache",
          priority: "u=1, i",
          "sec-ch-prefers-color-scheme": "dark",
          "sec-ch-ua":
            '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
          "sec-ch-ua-arch": '"x86"',
          "sec-ch-ua-bitness": '"64"',
          "sec-ch-ua-form-factors": '"Desktop"',
          "sec-ch-ua-full-version": '"131.0.6778.205"',
          "sec-ch-ua-full-version-list":
            '"Google Chrome";v="131.0.6778.205", "Chromium";v="131.0.6778.205", "Not_A Brand";v="24.0.0.0"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-model": '""',
          "sec-ch-ua-platform": '"Windows"',
          "sec-ch-ua-platform-version": '"15.0.0"',
          "sec-ch-ua-wow64": "?0",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-client-data":
            "CJG2yQEIo7bJAQipncoBCPSHywEIlqHLAQiKo8sBCIWgzQEIstPOAQii1M4BCLzXzgEIx9jOAQjN2M4BGI/OzQEYztXOAQ==",
          "x-goog-ext-353267353-jspb": "[null,null,null,147535]",
          "x-maps-diversion-context-bin": "CAE=",
          Referer: "https://www.google.com/",
          "Referrer-Policy": "origin",
        },
        body: null,
        method: "GET",
      }
    );
    const html = await res.text();
    const data = html.substring(0, html.length - 6);
    const json = JSON.parse(data);
    const preparedData = prepare(json.d);
    const listResults = buildResults(preparedData);
    return listResults;
  } catch (err) {
    return [];
  }
}

(async () => {
  const place = await googleMapsTextSearch("Ottawa, ON");
  const grid = getLongLatList(place);
  let zoom = 18447.561833884985;
  let start = 0;
  const zoomLevels = [70000, 35000, 10000, 4000, 2000];
  let q = "thrift stores ottawa";
  let limit = 200;

  const promises = [];

  for (let i = 0; i < grid.length; i++) {
    const [lat, lng] = grid[i];
    // Pushing into promises array
    promises.push(getGoogleMapsData(q, lat, lng, zoom, limit, start));
  }
  const allResults = await Promise.all(promises);

  const unique = new Set();

  const finalResults = allResults.reduce((acc, cur) => {
    cur.forEach((result) => {
      if (!unique.has(result.placeId)) {
        unique.add(result.placeId);
        acc.push(result);
      }
    });
    return acc;
  }, []);

  console.log("finalResults.length", finalResults.length);

  fs.writeFileSync("test.json", JSON.stringify(finalResults, null, 2));
})();
