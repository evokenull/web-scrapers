import Papa from "papaparse";
import fs from "graceful-fs";

fs.readFile("./zip_code_database.csv", "utf8", (err, data) => {
  if (err) {
    console.log(err);
    return;
  }

  const results = Papa.parse(data, {
    header: false,
  });
  fs.writeFileSync("zip_code_database.json", JSON.stringify(results, null, 2));
});
