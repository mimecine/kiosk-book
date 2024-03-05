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

Products.filter((p) => Products.status == "active").forEach((p) => {
  p.images?.forEach(async (image, i) => {
    const local_file = `./src/content/products/${p.handle}/${p.handle}__${i}.jpg`;
    if (!(await exists(local_file))) {
      try {
        const blob = await (await fetch(image.src)).blob();

        await mkdir(`./src/content/products/${p.handle}`, { recursive: true });
        await writeFile(
          `./src/content/products/${p.handle}/${p.handle}__${i}.jpg`,
          blob.stream()
        );
        console.log(`Got ${local_file}`);
        delay(500);
      } catch (e) {
        console.log(p.handle, image.src);
      }
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
