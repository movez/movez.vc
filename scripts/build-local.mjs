#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const THEME = "wp-content/themes/hypra_theme";
const REMOTE = "https://hypra.fund";

const THEME_ASSETS = [
  "img/hero1.webp",
  "img/bg-main-tab.webp",
  "img/bg-main-mob.webp",
  "img/hero-bg-1.png",
  "img/hero-bg-mob-1.png",
  "img/hero-bg-2.png",
  "img/hero-bg-3.png",
  "img/contacts-img.png",
  "img/yahoo_g.svg",
  "img/bloomberg_g.svg",
  "img/forbes_g.svg",
  "img/forklog_g.svg",
  "img/ain_g.svg",
  "img/vector_g.svg",
  "img/inventure_g.svg",
  "img/block_g.svg",
  "img/coingraph_g.svg",
  "img/totop.svg",
  "img/cursor.png",
  "img/flag.png",
  "img/mail.svg",
  "img/twitter.svg",
  "img/utorg_logo.svg",
  "img/evacodes_bg.svg",
  "assets/fonts/favorite/Favorit_regular.woff",
  "assets/fonts/favorite/Favorit_bold.woff2",
  "assets/fonts/times/TimesNow-SemiLight.woff2",
];

const UPLOAD_ASSETS = [
  "wp-content/uploads/2022/09/Favicon-150x150.png",
  "wp-content/uploads/2022/09/Favicon-300x300.png",
];

const COPY_PATHS = [
  "thesis-overrides.css",
  "page-styles.css",
  "favicon.svg",
  "favicon.png",
  "privacy-policy",
  "cookie-policy",
  "thesis",
  "wp-content/4728793b5086e170d4db34b77c5a77e5_ver=f8fb1aedfd1991a7c1381ac7101e5d8b.js",
  "wp-content/0039b9d00fc33966e4557c547b0bc5db_ver=4e94ba324b76f9c24697ccba3157cddc.js",
  "wp-content/eb70db8f594c5f286bda9198906af606_ver=577d8f281f77870784dfe107af1e2d7a.js",
  "wp-content/themes/hypra_theme/assets/js",
  "wp-content/themes/hypra_theme/img",
  "wp-content/themes/hypra_theme/print_ver=1.0.css",
  "wp-content/plugins/wp-rocket/assets/js/lazyload/17.5/lazyload.min.js",
];

async function ensureDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function download(relativePath) {
  const dest = path.join(DIST, relativePath);
  await ensureDir(dest);

  const url = `${REMOTE}/${relativePath}`;
  const response = await fetch(url);
  if (!response.ok) {
    console.warn(`  skip (HTTP ${response.status}): ${relativePath}`);
    return false;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(dest, buffer);
  console.log(`  fetched: ${relativePath}`);
  return true;
}

async function copyTree(src, dest) {
  const stat = await fs.stat(src);
  if (stat.isDirectory()) {
    await fs.mkdir(dest, { recursive: true });
    for (const entry of await fs.readdir(src)) {
      await copyTree(path.join(src, entry), path.join(dest, entry));
    }
    return;
  }
  await ensureDir(dest);
  await fs.copyFile(src, dest);
}

function patchHtml(html) {
  let out = html;

  // Drop WP Rocket boot script that delays all JS until user interaction.
  out = out.replace(
    /<script>class RocketLazyLoadScripts[\s\S]*?RocketLazyLoadScripts\.run\(\);<\/script>/,
    ""
  );

  // Use local stylesheets only.
  out = out.replace(
    /<link rel="stylesheet" href="https:\/\/hypra\.fund\/wp-content\/themes\/hypra_theme\/style\.css\?ver=1\.0" media="all">\s*<link rel="stylesheet" href="thesis-overrides\.css\?ver=1\.0" media="all">/,
    `<link rel="stylesheet" href="${THEME}/style.css?ver=1.0" media="all">\n<link rel="stylesheet" href="thesis-overrides.css?ver=1.0" media="all">`
  );

  // Local font preloads.
  out = out.replaceAll(
    "https://hypra.fund/wp-content/themes/hypra_theme/assets/fonts/",
    `${THEME}/assets/fonts/`
  );

  // Normalize broken export paths to local theme assets.
  out = out.replaceAll("https://hypra.fund/wp-content/", "wp-content/");
  out = out.replaceAll(/\/hypra\.fund\/hypra\.(?:fund|vc)\/wp-content\//g, "wp-content/");
  out = out.replaceAll(/\/Users\/josh\/Downloads\/hypra\.fund(?:\s2)?\/wp-content\//g, "wp-content/");
  out = out.replaceAll(/hypra\.fund\/hypra\.fund\/wp-content\//g, "wp-content/");
  out = out.replaceAll(/data-lazy-src="\/wp-content\//g, 'data-lazy-src="wp-content/');
  out = out.replaceAll(/src="\/wp-content\//g, 'src="wp-content/');

  // Load theme scripts immediately for local dev.
  out = out.replaceAll('type="rocketlazyloadscript" ', "");
  out = out.replaceAll("type='rocketlazyloadscript' ", "");
  out = out.replaceAll(' data-rocket-type="text/javascript"', "");

  // Keep styles after load — critical CSS includes above-the-fold layout.
  out = out.replace(
    /<script>"use strict";function wprRemoveCPCSS\(\)[\s\S]*?<\/script>/,
    ""
  );

  // Cookie banner hides content until consent; disable for local preview.
  out = out.replace(
    /<style>\[consent-id\]:not\(\.rcb-content-blocker\)[\s\S]*?<\/style>/,
    ""
  );

  // Load jQuery → slick → main in order (no defer races that break the team slider).
  out = out.replace(
    /<script[^>]*src="wp-content\/themes\/hypra_theme\/assets\/js\/jquery-3\.6\.1\.min_ver%3D1\.0\.js"[^>]*><\/script>/,
    '<script src="wp-content/themes/hypra_theme/assets/js/jquery-3.6.1.min_ver%3D1.0.js" id="jquerymin-js"></script>'
  );
  out = out.replace(
    /<script[^>]*src="wp-content\/themes\/hypra_theme\/assets\/js\/slick\.min\.js"[^>]*><\/script>/,
    '<script src="wp-content/themes/hypra_theme/assets/js/slick.min.js" id="slick-js"></script>'
  );
  out = out.replace(
    /<script[^>]*src="wp-content\/themes\/hypra_theme\/assets\/js\/main\.js"[^>]*><\/script>/,
    '<script src="wp-content/themes/hypra_theme/assets/js/main.js" id="main-js"></script>'
  );

  return out;
}

async function buildCss() {
  const baseCss = await fs.readFile(path.join(ROOT, "style.css"), "utf8");
  const overrides = await fs.readFile(path.join(ROOT, "thesis-overrides.css"), "utf8");
  const themeCssPath = path.join(DIST, THEME, "style.css");
  await ensureDir(themeCssPath);
  await fs.writeFile(
    themeCssPath,
    `${baseCss.trim()}\n\n/* Local thesis + header overrides */\n${overrides.trim()}\n`
  );
  console.log(`  wrote: ${THEME}/style.css`);
}

async function main() {
  console.log("Building local site into dist/ ...\n");

  await fs.rm(DIST, { recursive: true, force: true });
  await fs.mkdir(DIST, { recursive: true });
  // GitHub Pages: skip Jekyll processing so files/dirs with special chars are served as-is.
  await fs.writeFile(path.join(DIST, ".nojekyll"), "");
  await fs.writeFile(path.join(DIST, "CNAME"), "movez.vc\n");

  console.log("Copying static files...");
  for (const rel of COPY_PATHS) {
    const src = path.join(ROOT, rel);
    const dest = path.join(DIST, rel);
    try {
      await copyTree(src, dest);
      console.log(`  copied: ${rel}`);
    } catch {
      console.warn(`  skip missing: ${rel}`);
    }
  }

  console.log("\nDownloading theme assets from hypra.fund...");
  for (const asset of THEME_ASSETS) {
    await download(`${THEME}/${asset}`);
  }

  console.log("\nDownloading uploads...");
  for (const asset of UPLOAD_ASSETS) {
    await download(asset);
  }

  console.log("\nWriting CSS...");
  await buildCss();
  await fs.copyFile(
    path.join(ROOT, "thesis-overrides.css"),
    path.join(DIST, "thesis-overrides.css")
  );

  console.log("\nPatching index.html...");
  const html = await fs.readFile(path.join(ROOT, "index.html"), "utf8");
  await fs.writeFile(path.join(DIST, "index.html"), patchHtml(html));

  console.log("\nDone. Run: npm run dev");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
