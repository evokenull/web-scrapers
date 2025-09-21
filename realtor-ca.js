import fetch from "node-fetch";
import fs from "graceful-fs";

(async () => {
  const res = await fetch(
    "https://api2.realtor.ca/Listing.svc/PropertySearch_Post",
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        pragma: "no-cache",
        priority: "u=1, i",
        "sec-ch-ua":
          '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        Referer: "https://www.realtor.ca/",
        cookie: "reese84=12",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: "ZoomLevel=15&LatitudeMax=45.43958&LongitudeMax=-75.61985&LatitudeMin=45.41994&LongitudeMin=-75.71392&Sort=6-D&PropertyTypeGroupID=1&TransactionTypeId=2&PropertySearchTypeId=0&Currency=CAD&IncludeHiddenListings=false&RecordsPerPage=12&ApplicationId=1&CultureId=1&Version=7.0&CurrentPage=1",
      method: "POST",
    }
  );
  console.log(res.status);
  const json = await res.json();
  console.log(json);
  fs.writeFileSync("test.json", JSON.stringify(json, null, 2));
})();
