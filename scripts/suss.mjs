// run with node --experimental-modules

import fs from "fs";
import yaml from "yaml";
import TurndownService from "turndown";

const T = new TurndownService();

const l = console.log;

const D = JSON.parse(
  fs.readFileSync("./src/assets/archive.kioskkiosk.json").toString()
);

// D.Products.filter((_p) => _p.status == "active").forEach((_p) => {
//   var html = _p.body_html;
//   var md = html ? T.turndown(html) : "";
//   md = md.replace(/<!--.*-->/g, "");

//   var [meta, ...body] = md.split("\n\n");
//   body = body.join("\n\n").trim();

//   var dim = [],
//     mat = "",
//     prov = "";
//   meta.split("\n").forEach((ln) => {
//     if (ln.match(/[A-Z]{3,}/)) {
//       prov = ln;
//       return;
//     }
//     if (ln.match(/\d+"/)) {
//       dim.push(ln);
//       return;
//     }
//     mat = ln;
//   });
//   dim = dim.join(", ");

//   _p.dimensions = dim.trim();
//   _p.materials = mat.trim();
//   _p.materials_array = mat.split(/\s*(?:,|&|and)\s*/).map(p => p.trim)
//   _p.provenance = prov.trim();
//   _p.product_type = (_p.product_type || "Misc").trim();

//   "body_html variants body_lines options template_suffix published_scope image"
//     .split(" ")
//     .forEach((attr) => {
//       delete _p[attr];
//     });

//   _p.images.forEach((_i, i) => {
//     _i.alt = _i.alt || "";
//     _i.oldSrc = _i.src;
//     _i.src = `./${_p.handle}/${_p.handle}__${i}.jpg`;
//   });

// });

// D.Pages.forEach(p => {
//   l(p.metafield)
// });

// D.Collections.forEach( (c) => {
//   c.product_ids = D.Collects.filter(entry => entry.collection_id == c.id ).map(entry=>entry.product_id)
//   c.product_handles = D.Products.filter( p => c.product_ids.includes(p.id)).map(p => p.handle);
// } )

// const groups = Object.groupBy(D.Products, p=>p.product_type);
// l(Object.keys(groups))

// l(D.Collections[0].product_handles)

// l(D.Collections[0])

D.Products.filter((_p) => _p.status == "active").forEach((_p) => {
  var html = _p.body_html;
  var md = html ? T.turndown(html) : "";
  md = md.replace(/<!--.*-->/g, "");

  var [meta, ...body] = md.split("\n\n");

  var dim = [],
    mat = "",
    prov = "";
  meta.split("\n").forEach((ln) => {
    if (ln.match(/[A-Z]{3,}/)) {
      prov = ln;
      return;
    }
    if (ln.match(/\d+"/)) {
      dim.push(ln);
      return;
    }
    mat = ln;
  });
  dim = dim.join(", ");

  _p.dimensions = dim.trim();
  _p.materials = mat.trim();
  _p.materials_array = mat.split(/\s*(?:,|&|and)\s*/).map((p) => p.trim());

  _p.provenance = prov.trim();
  _p.body = body.join("\n\n").trim();
});

const collections = [
  "the-later-years",
  "year-of-the-circle-holiday-2020",
  "holiday-2019",
  "italy-2",
  "italy-1",
  "romania",
  "recall",
  "greece",
  "holiday-2013",
  "lend-a-hand",
  "the-netherlands",
  "obama-2012",
  "colombia",
  "india-2",
  "america-4",
  "india",
  "japan-two",
  "america-3",
  "iceland",
  "groundhog-day",
  "portugal",
  "mini-provence",
  "america-2",
  "9things",
  "america-1",
  "hong-kong",
  "8things",
  "finland",
  "germany",
  "mexico",
  "sweden",
  "japan",
].reverse();

const Active = D.Products.filter((_p) => _p.status == "active");
const G = Object.groupBy(Active, (p) => p.product_type);

const groups = Object.groupBy(Active, (data) => data.product_type);

const exhibits = [
  "Italy 2",
  "Italy 1",
  "Romania",
  "Recall",
  "Greece",
  "Holiday 2013",
  "Lend a Hand",
  "The Netherlands",
  "Obama 2012",
  "Colombia",
  "India #2",
  "America #4",
  "India",
  "Japan #2",
  "America #3",
  "Iceland",
  "Groundhog Day",
  "Portugal",
  "Provence",
  "America #2",
  "9 for 2009",
  "America #1",
  "Hong Kong",
  "8 Things",
  "Finland",
  "Germany",
  "Mexico",
  "Sweden",
  "Japan",
].reverse();

// exhibits.forEach(e => {
//  l(JSON.stringify(groups['8 Things']))
// })

// exhibits.map(e => {
//   l(e);
// })

// for (const [k,v] of Object.entries(G).sort((a,b) => b[1].length - a[1].length)) {
//     l(`"${k}"`, v.length, v[0].title);
// }

// G[''].forEach((p,i) => { l(p.title)})

// const pages = D.Pages.filter((p) => p.title.startsWith("BOOK:")).map((p) => {
//   [,p.where,p.title] = p.title.split(':');
//   return p;
// });

// l(pages.find(p => p.where.trim() == "America #2 ".trim() )?.body_html)

const products_by_material = {};
Active.slice(0, 50).forEach((p) => {
  l(p.materials_array.length);
  p.materials_array.forEach((m) => {
    if (!products_by_material[m]) products_by_material[m] = [];
    products_by_material[m].push(p);
  });
});
Object.entries(products_by_material).forEach((k) => {
  l(':',k[0],':');
  k[1].forEach(p => {
    l(p.title)
  })
});
