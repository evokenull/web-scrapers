import { gotScraping } from "got-scraping";
import fs from "graceful-fs";
import * as cheerio from "cheerio";
import { getSmartProxyUrl } from "./proxies.js";
/**
 * Decodes a custom encoded string back into a JavaScript object.
 *
 * The encoding format is as follows:
 * - The first character represents the number of '=' padding characters.
 * - The next segment is the reversed Base64-encoded JSON string.
 * - It ends with the suffix "NmL".
 *
 * @param {string} encodedStr - The encoded string to decode.
 * @returns {Object} - The decoded JavaScript object.
 * @throws Will throw an error if the input string is invalid or decoding fails.
 */
function decodeData(encodedStr) {
  /**
   * Helper function to decode a Base64 string to a UTF-8 string using Buffer.
   * @param {string} base64 - The Base64 string to decode.
   * @returns {string} - The decoded UTF-8 string.
   */
  function base64ToString(base64) {
    return Buffer.from(base64, "base64").toString("utf-8");
  }

  // Validation: Ensure the string is not empty and has the required structure
  if (typeof encodedStr !== "string" || encodedStr.length < 4) {
    // At least padding count + suffix
    throw new Error("Invalid encoded string format.");
  }

  // Step 1: Extract the padding count from the first character
  const paddingChar = encodedStr[0];
  const paddingCount = parseInt(paddingChar, 10);

  if (isNaN(paddingCount)) {
    throw new Error("Invalid padding count in encoded string.");
  }

  // Step 2: Verify the string ends with the expected suffix "NmL"
  const suffix = "NmL";
  if (!encodedStr.endsWith(suffix)) {
    throw new Error(`Encoded string must end with the suffix "${suffix}".`);
  }

  // Step 3: Remove the padding count and the suffix to extract the reversed encoded part
  const reversedEncodedPart = encodedStr.slice(1, -suffix.length);

  if (reversedEncodedPart.length === 0) {
    throw new Error("Encoded part is missing from the input string.");
  }

  // Step 4: Reverse the encoded part to get the original Base64 string without padding
  const base64WithoutPadding = reversedEncodedPart.split("").reverse().join("");

  // Step 5: Reconstruct the original Base64 string by adding the required '=' padding
  const base64Padded = `${base64WithoutPadding}${"=".repeat(paddingCount)}`;

  // Step 6: Decode the Base64 string to get the URI-encoded JSON string
  let uriEncodedJson;
  try {
    uriEncodedJson = base64ToString(base64Padded);
  } catch (error) {
    throw new Error("Base64 decoding failed: " + error.message);
  }

  // Step 7: Decode URI components to get the JSON string
  let jsonString;
  try {
    jsonString = decodeURIComponent(uriEncodedJson);
  } catch (error) {
    throw new Error("URI decoding failed: " + error.message);
  }

  // Step 8: Parse the JSON string back into a JavaScript object
  let parsedData;
  try {
    parsedData = JSON.parse(jsonString);
  } catch (error) {
    throw new Error("JSON parsing failed: " + error.message);
  }

  return parsedData;
}

(async () => {
  const res = await gotScraping({
    url: "https://beacons.ai/jeremoabo",
    proxyUrl: getSmartProxyUrl(),
  });
  console.log(res.statusCode);
  const $ = cheerio.load(res.body);
  const __image__ = $("#__image__").html();
  const decoded = decodeData(__image__);
  fs.writeFileSync("test.json", JSON.stringify(decoded, null, 2));
})();
