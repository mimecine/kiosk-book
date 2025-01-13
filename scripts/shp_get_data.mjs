import { getAll, session, delay, shopify } from "./shp_base.mjs";
import { writeFile, mkdir } from "node:fs/promises";
import { promises as fs } from "node:fs";

let Products = [],
  SmartCollections = [],
  CustomCollections = [],
  Metafields = [],
  Collects = [],
  Pages = [],
  PagesMeta = [];

try {
  Products = await getAll("Product", session);
    // for await (const p of Products) {
    //   p.metafields = (await shopify.rest.Metafield.all({
    //     session: session,
    //     product_id: p.id
    //   })).data
    //   console.log("Metafields", p.title, p.metafields.length);
    //   await delay(600)
    // }
  console.log("Product", Products.length);
} catch (e) {
  console.log("Product E", e);
}

try {
  SmartCollections = await getAll("SmartCollection", session);
  console.log("SmartCollection", SmartCollections.length);
} catch (e) {
  console.log("SmartCollection E", e);
}

try {
  CustomCollections = await getAll("CustomCollection", session);
  console.log("CustomCollection", CustomCollections.length);
} catch (e) {
  console.log("CustomCollection E", e);
}

try {
  Collects = await getAll("Collect", session);
  console.log("Collect", Collects.length);
} catch (e) {
  console.log("Collect E", e);
}

try {
  Pages = await getAll("Page", session);
  console.log("Page", Pages.length);
  Pages.forEach(async p => {
    p.metafields = (await shopify.rest.Metafield.all({
      session: session,
      page_id: p.id
    })).data
  })
} catch (e) {
  console.log("Page E", e);
}


try {
  Metafields = await getAll("Metafield", session);
  console.log("Metafield", Metafields.length);
} catch (e) {
  console.log("Metafield E", e);
}

Products.filter((p) => p.status == "active").forEach((p) => {
  p.images?.forEach(async (image, i) => {
    const local_file = `./src/content/products/${p.handle}/${p.handle}__${i}.jpg`;

    if (!(await exists(local_file))) {

      try {
        await mkdir(`./src/content/products/${p.handle}`, { recursive: true });
        await downloadImage(image.src, local_file);
        console.log(`Downloaded (for ${p.data.title}) ${image.src} to ${local_file}`);
      } catch (e) {
        console.log(local_file, e);
      }
      
    } else {
      // console.log(`Already have ${local_file}`);
    }
  });
});

await writeFile(
  "./src/assets/archive.kioskkiosk.json",
  JSON.stringify({
    Products,
    SmartCollections,
    CustomCollections,
    Collects,
    Pages,
    Metafields,
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
}