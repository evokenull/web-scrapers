import { gotScraping } from "got-scraping";
import fs from "graceful-fs";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { getSmartProxyUrl } from "./proxies.js";
import { supabase } from "./supabaseClients.js";

(async () => {
  const { data, error } = await supabase
    .from("test-table")
    .select("*")
    .eq("name", "test");
  if (error) {
    console.log("error", error);
  }
  console.log(data);
})();
