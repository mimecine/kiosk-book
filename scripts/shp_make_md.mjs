// run with node --experimental-modules

import fs from "node:fs";
import yaml from "yaml";
import TurndownService from "turndown";
import Sharp from "sharp";
//import fg from "fast-glob";

const T = new TurndownService();

const D = JSON.parse(
  fs.readFileSync("./src/assets/archive.kioskkiosk.json").toString()
);

fs.mkdirSync('./src/content/pages/',{recursive:true});


D.Products.filter((_p) => _p.status == "active").forEach((_p) => {
  var html = _p.body_html;
  var md = html ? T.turndown(html) : "";
  md = md.replace(/<!--.*-->/g, "");

  var [meta, ...body] = md.split("\n\n");
  body = body.join("\n\n").trim();

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

  _p.dimensions = dim.trim().replace(/(\s|^)0\./,'.');
  _p.dimensions_array = dim.replace(/[a-z\s]+:/gmi,'').split(/(?<![a-z])x(?![a-z])|\*|&|,|\bby\b/).map(p => p.trim()).filter(p => p != '');
  _p.materials = mat.trim();
  _p.materials_array = mat.split(/,|\.|&|\sand\s/).map(p => p.trim()).filter(p => p != '');
  _p.provenance = prov.trim();
  _p.product_type = (_p.product_type || "Misc").trim();

  "body_html variants body_lines options template_suffix published_scope image"
    .split(" ")
    .forEach((attr) => {
      delete _p[attr];
    });

  _p.images.forEach((_i, i) => {
    _i.alt = _i.alt || "";
    _i.oldSrc = _i.src;

    new Sharp(`./src/content/products/${_p.handle}/${_p.handle}__${i}.jpg`)
        .resize(250, 250)
        .tint({ r: 255, g: 0, b: 0 })
        .toFile(`./src/content/products/${_p.handle}/${_p.handle}__${i}.jpg`.replace(/\.([a-z]{3,4}$)/,'-thumb.$1'), function(err) {
          console.log(err)
    }); 

    _i.thumb = `./${_p.handle}/${_p.handle}__${i}.jpg`.replace(/\.([a-z]{3,4}$)/,'-thumb.$1');
    _i.src = `./${_p.handle}/${_p.handle}__${i}.jpg`;
  });

  var fm = yaml.stringify(_p);

  try {
    fs.writeFileSync(
      `./src/content/products/${_p.handle}.md`,
      `---\n${fm}\n---\n\n${body}`
    );
  } catch (e) {
    console.log(e);
  }
  if(_p.status = 'active' && _p.dimensions.length < 1 ) console.log(['DIM',_p.title, _p.product_type].join(': '))
  if(_p.status = 'active' && _p.materials.length < 1) console.log(['MAT',_p.title, _p.product_type].join(': '))
  if(_p.status = 'active' && _p.provenance.length < 1) console.log(['PRO',_p.title, _p.product_type].join(': '))
});

D.CustomCollections.forEach((c) => {
  c.product_ids = D.Collects.filter((entry) => entry.collection_id == c.id).map(
    (entry) => entry.product_id
  );
  c.product_handles = D.Products.filter((p) =>
    c.product_ids.includes(p.id)
  ).map((p) => p.handle);

  var html = c.body_html || "";
  var md = html ? T.turndown(html) : "";
  md = md.replace(/<!--.*-->/g, "");

  var fm = yaml.stringify(c);

  try {
    fs.writeFileSync(
      `./src/content/collections/${c.handle}.md`,
      `---\n${fm}\n---\n\n${md}`
    );
  } catch (e) {
    console.log(e);
  }
});

D.SmartCollections.forEach((c) => {
  var html = c.body_html || "";
  var md = html ? T.turndown(html) : "";
  md = md.replace(/<!--.*-->/g, "");

  var fm = yaml.stringify(c);

  try {
    fs.writeFileSync(
      `./src/content/collections/${c.handle}.md`,
      `---\n${fm}\n---\n\n${md}`
    );
  } catch (e) {
    console.log(e);
  }
});

D.Pages.forEach((c) => {
  var html = c.body_html || "";
  var md = html ? T.turndown(html) : "";
  md = md.replace(/<!--.*-->/g, "");

  var fm = yaml.stringify(c);

  try {
    fs.writeFileSync(
      `./src/content/pages/${c.handle}.md`,
      `---\n${fm}\n---\n\n${md}`
    );
  } catch (e) {
    console.log(e);
  }
});
