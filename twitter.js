import fetch from "node-fetch";
import { getMobileSmartProxyAgent } from "./proxies.js";
import fs from "graceful-fs";

(async () => {
  const res = await fetch(
    "https://api.x.com/graphql/QGIw94L0abhuohrr76cSbw/UserByScreenName?variables=%7B%22screen_name%22%3A%22adrian_horning_%22%7D&features=%7B%22hidden_profile_subscriptions_enabled%22%3Atrue%2C%22profile_label_improvements_pcf_label_in_post_enabled%22%3Afalse%2C%22rweb_tipjar_consumption_enabled%22%3Atrue%2C%22responsive_web_graphql_exclude_directive_enabled%22%3Atrue%2C%22verified_phone_label_enabled%22%3Afalse%2C%22subscriptions_verification_info_is_identity_verified_enabled%22%3Atrue%2C%22subscriptions_verification_info_verified_since_enabled%22%3Atrue%2C%22highlights_tweets_tab_ui_enabled%22%3Atrue%2C%22responsive_web_twitter_article_notes_tab_enabled%22%3Atrue%2C%22subscriptions_feature_can_gift_premium%22%3Atrue%2C%22creator_subscriptions_tweet_preview_api_enabled%22%3Atrue%2C%22responsive_web_graphql_skip_user_profile_image_extensions_enabled%22%3Afalse%2C%22responsive_web_graphql_timeline_navigation_enabled%22%3Atrue%7D&fieldToggles=%7B%22withAuxiliaryUserLabels%22%3Afalse%7D",
    {
      agent: getMobileSmartProxyAgent(),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        authorization:
          "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
        "content-type": "application/json",
        priority: "u=1, i",
        "sec-ch-ua":
          '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "x-guest-token": "1873019603510526029",
        "x-twitter-active-user": "yes",
        "x-twitter-client-language": "en",
        Referer: "https://x.com/",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: null,
      method: "GET",
    }
  );
  console.log(res.status);

  const json = await res.json();

  console.log(json);
})();

/*     67215: (e, n, d) => {
        "use strict";
        d.d(n, {
            h: () => t,
            q: () => r
        });
        const t = (e, n) => n(e);
        function r(...e) {
            return e.length < 1 ? t : e.reduceRight(( (e, n) => e ? (d, t) => n(d, (n => e(n, t))) : n))
        }
    }
        
    
        function Wn(e) {
            return async (n, t) => {
                if (!zn.test(n.host))
                    return t(n);
                const r = {
                    ...n
                };
                if (e.isTrue("rweb_client_transaction_id_enabled")) {
                    const {method: e, path: t} = n;
                    try {
                        r.headers["x-client-transaction-id"] = await async function(e, n) {
                            jn = jn || new Promise((e => {
                                d.e("ondemand.s").then(d.bind(d, 471269)).then((n => e(n.default())))
                            }
                            ));
                            const t = await jn;
                            return await t(e, n)
                        }(function(e) {
                            return (e || "").split("?")[0].trim()
                        }(t), e)
                    } catch (e) {
                        r.headers["x-client-transaction-id"] = btoa(`e:${e}`)
                    }
                }
                return t(r)
            }
        }
    
    
    
    */
