
import "@shopify/shopify-api/adapters/node";
import { shopifyApi, ApiVersion, Session } from "@shopify/shopify-api";
import { restResources }  from "@shopify/shopify-api/rest/admin/2023-04";

async function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

const shopify = shopifyApi({
  apiSecretKey: process.env.SHP_API_SECRET_KEY, // Note: this is the API Secret Key, NOT the API access token
  apiVersion: ApiVersion.October23,
  isCustomStoreApp: true, // this MUST be set to true (default is false)
  adminApiAccessToken: process.env.SHP_ADMIN_API_ACCESS_TOKEN, // Note: this is the API access token, NOT the API Secret Key
  isEmbeddedApp: false,
  hostName: process.env.SHP_HOSTNAME,
  restResources,
});

const session = shopify.session.customAppSession(process.env.SHP_HOSTNAME);

const getAll = async (method, session) => {
  let pageInfo = null;
  let all = [];
  do {
    await delay(600);
    var response = await shopify.rest[method].all({
      ...pageInfo?.nextPage?.query,
      session,
      limit: 250,
    });
    var page = response.data;
    all = all.concat(page);
    pageInfo = response.pageInfo;
    console.log(all.length);
  } while (pageInfo?.nextPage);
  return all;
};

export  {getAll, session, delay, shopify};

// var Products = await getAll("Product", session);
// var Collections = await getAll("Collection", session);
// var Collects = await getAll("Collect", session);
