import { queryAllProducts, getAll, session, delay, shopify } from "./shp_base.mjs";
import { writeFile, mkdir } from "node:fs/promises";
import { promises as fs } from "node:fs";

let Products = [];

  try {
    Products = await queryAllProducts(session);
    // for await (const p of Products) {
    //   p.metafields = (await shopify.rest.Metafield.all({
    //     session: session,
    //     product_id: p.id
    //   })).data
    //   console.log("Metafields", p.title, p.metafields.length);
    //   await delay(1000)
    // }
    console.log("Product", Products.length);
  } catch (e) {
    console.log("Product E", e);
  }

  try {
    Products = await queryAllProducts(session);
    console.log("Product", Products.length);
  } catch (e) {
    console.log("Product E", e);
  }




await writeFile(
  "./src/assets/test-archive.kioskkiosk.json",
  JSON.stringify({
    Products,
    // SmartCollections,
    // CustomCollections,
    // Collects,
    // Pages,
    // Metafields,
  })
);

/////////////////////// Utils

async function exists(f) {
  try {
    var stat = await fs.stat(f);
    return stat.size !== 0;
  } catch (e) {
    return false;
  }
}

async function downloadImage(imageUrl, imagePath) {

  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  await fs.writeFile(imagePath, buffer);
  return `Image downloaded to ${imagePath}`;
}