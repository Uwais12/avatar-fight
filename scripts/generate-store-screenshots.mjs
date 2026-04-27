#!/usr/bin/env node
// Render 6 App Store landscape screenshots at 2796x1290 (iPhone 6.7"/6.9" — Apple accepts the same set).
// Uses Playwright + an HTML template per shot; each page references the game's own art assets.

import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = path.resolve(process.cwd());
const OUT = path.join(ROOT, "assets/store-screenshots");
const ASSETS = path.join(ROOT, "assets/generated");
await fs.mkdir(OUT, { recursive: true });

const W = 2796;
const H = 1290;

const SHOTS = [
  {
    file: "01-hero.png",
    headline: "PICK\nA HERO.",
    sub: "Five chibi classes. One throne to take.",
    layout: "five-row",
    chars: ["char-knight", "char-ninja", "char-mage", "char-archer", "char-vampire"],
    bg: "parchment",
  },
  {
    file: "02-gear.png",
    headline: "GEAR THAT\nSHOWS UP.",
    sub: "Buy it. Equip it. See it on your hero — instantly.",
    layout: "split-gear",
    char: "knight__plate__sword",
    items: ["weapon-sword", "armor-plate", "weapon-bow"],
    bg: "parchment",
  },
  {
    file: "03-pets.png",
    headline: "PET\nCOMPANIONS.",
    sub: "Up to three fight beside you. Each with its own HP.",
    layout: "trio-pets",
    chars: ["pet-red-dragon", "pet-eagle", "pet-wolf"],
    bg: "bamboo",
  },
  {
    file: "04-battle.png",
    headline: "30-SECOND\nDUELS.",
    sub: "Crits, dodges, lucky upsets. Land the blow.",
    layout: "vs",
    left: "knight__plate__sword",
    right: "vampire__chain__staff",
    bg: "bamboo",
  },
  {
    file: "05-arena.png",
    headline: "CLIMB\nTHE ARENA.",
    sub: "Sweep rosters. Conquer rivals. Earn gold and crystals.",
    layout: "ladder",
    chars: ["char-vampire", "char-mage", "char-archer", "char-ninja"],
    bg: "ruins",
  },
  {
    file: "06-beta.png",
    headline: "JOIN\nTHE BETA.",
    sub: "Tester names go in the launch credits.",
    layout: "icon-cta",
    icon: "app-icon-1024",
    bg: "parchment",
  },
];

function bg(kind) {
  if (kind === "bamboo") return "linear-gradient(180deg, #7da848 0%, #5a7a30 50%, #9c8350 100%)";
  if (kind === "ruins") return "linear-gradient(180deg, #6a6878 0%, #3a3848 100%)";
  return "radial-gradient(ellipse at 30% 20%, rgba(212,162,58,0.25), transparent 50%), linear-gradient(180deg, #efd9a1 0%, #d8b96d 100%)";
}

// Cache base64 data URIs so each shot can reuse them.
const dataUriCache = new Map();
async function dataUri(relPath) {
  if (dataUriCache.has(relPath)) return dataUriCache.get(relPath);
  const file = path.join(ASSETS, relPath + ".png");
  const buf = await fs.readFile(file);
  const uri = `data:image/png;base64,${buf.toString("base64")}`;
  dataUriCache.set(relPath, uri);
  return uri;
}

async function html(shot) {
  const heading = shot.headline.replace(/\n/g, "<br/>");
  const charImgs = shot.chars
    ? await Promise.all(shot.chars.map(async (c) => `<img class="char" src="${await dataUri(c)}" />`))
    : [];
  let stage = "";
  if (shot.layout === "five-row") {
    stage = `<div class="row five">${charImgs.join("")}</div>`;
  } else if (shot.layout === "split-gear") {
    const charSrc = await dataUri("combos/" + shot.char);
    const gearImgs = await Promise.all(shot.items.map(async (i) => `<img class="gear" src="${await dataUri(i)}" />`));
    stage = `
      <div class="splitGear">
        <img class="bigChar" src="${charSrc}" />
        <div class="gearStack">${gearImgs.join("")}</div>
      </div>`;
  } else if (shot.layout === "trio-pets") {
    stage = `<div class="row three">${charImgs.join("")}</div>`;
  } else if (shot.layout === "vs") {
    const left = await dataUri("combos/" + shot.left);
    const right = await dataUri("combos/" + shot.right);
    stage = `
      <div class="vs">
        <img class="bigChar left" src="${left}" />
        <div class="vsBadge">VS</div>
        <img class="bigChar right" src="${right}" />
      </div>`;
  } else if (shot.layout === "ladder") {
    stage = `<div class="row four">${charImgs.join("")}</div>`;
  } else if (shot.layout === "icon-cta") {
    const icon = await dataUri(shot.icon);
    stage = `
      <div class="iconCta">
        <img class="logo" src="${icon}" />
        <div class="cta">avatar-fight-web.vercel.app</div>
      </div>`;
  }

  return `<!doctype html>
<html><head><meta charset="utf-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: ${W}px; height: ${H}px; overflow: hidden; }
  body {
    background: ${bg(shot.bg)};
    position: relative;
    font-family: 'Cinzel', 'Trajan Pro', 'Times New Roman', serif;
    color: #2a1810;
  }
  .grain {
    position: absolute; inset: 0;
    background-image:
      repeating-linear-gradient(45deg, rgba(122,74,37,0.04) 0 1px, transparent 1px 14px),
      repeating-linear-gradient(-45deg, rgba(122,74,37,0.04) 0 1px, transparent 1px 14px);
    pointer-events: none;
  }
  .frame {
    position: absolute;
    inset: 24px;
    border: 6px double rgba(58,24,8,0.45);
    border-radius: 32px;
    pointer-events: none;
  }
  .copy {
    position: absolute;
    left: 90px; top: 90px;
    max-width: 1180px;
    z-index: 5;
  }
  .copy.right {
    left: auto; right: 90px; text-align: right;
  }
  .pill {
    display: inline-block;
    background: #b22e22;
    color: #fff8d8;
    font-weight: 900;
    letter-spacing: 0.4em;
    font-size: 24px;
    padding: 10px 22px;
    border-radius: 999px;
    border: 4px solid #5a0e08;
    margin-bottom: 30px;
  }
  h1 {
    font-family: 'Cinzel', serif;
    font-weight: 900;
    font-size: 220px;
    line-height: 0.9;
    color: #2a1810;
    letter-spacing: -2px;
    text-shadow: 6px 6px 0 rgba(122,74,37,0.18);
  }
  h1 .accent { color: #b22e22; }
  .sub {
    margin-top: 30px;
    font-size: 44px;
    color: #4a2818;
    font-weight: 600;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    max-width: 1100px;
    line-height: 1.25;
  }
  .stage {
    position: absolute;
    right: 0; top: 0; bottom: 0;
    width: 1500px;
    display: flex; align-items: center; justify-content: center;
    z-index: 1;
  }
  .row { display:flex; align-items:flex-end; gap: 30px; padding: 0 60px; }
  .row.five .char { width: 260px; height: 260px; object-fit: contain; filter: drop-shadow(0 24px 28px rgba(40,20,8,0.45)); }
  .row.three .char { width: 380px; height: 380px; object-fit: contain; filter: drop-shadow(0 24px 28px rgba(0,0,0,0.45)); }
  .row.four .char { width: 320px; height: 320px; object-fit: contain; filter: drop-shadow(0 24px 28px rgba(0,0,0,0.55)); }
  .splitGear { display:flex; align-items:center; gap: 60px; }
  .splitGear .bigChar { width: 760px; height: 760px; object-fit: contain; filter: drop-shadow(0 24px 28px rgba(40,20,8,0.5)); }
  .gearStack { display:flex; flex-direction:column; gap: 36px; }
  .gearStack .gear {
    width: 220px; height: 220px;
    background: #f6e8be;
    border: 6px solid #7a4a25;
    border-radius: 26px;
    padding: 20px;
    object-fit: contain;
    box-shadow: 0 12px 0 rgba(58,24,8,0.35);
  }
  .vs { display:flex; align-items:center; gap: 60px; }
  .vs .bigChar { width: 720px; height: 720px; object-fit: contain; filter: drop-shadow(0 24px 28px rgba(0,0,0,0.55)); }
  .vs .bigChar.right { transform: scaleX(-1); }
  .vsBadge {
    width: 200px; height: 200px;
    border-radius: 50%;
    background: linear-gradient(180deg,#c44030,#5a0e08);
    border: 8px solid #2a0808;
    color: #fff8d8;
    display:flex; align-items:center; justify-content:center;
    font-weight: 900; font-size: 96px; letter-spacing: 4px;
    box-shadow: 0 18px 0 rgba(0,0,0,0.4);
  }
  .iconCta { display:flex; flex-direction:column; align-items:center; gap: 60px; }
  .iconCta .logo {
    width: 720px; height: 720px;
    border-radius: 180px;
    box-shadow: 0 30px 60px rgba(58,24,8,0.5);
  }
  .iconCta .cta {
    background: #2a1810;
    color: #ffd848;
    font-weight: 900;
    font-size: 56px;
    padding: 26px 50px;
    border-radius: 16px;
    letter-spacing: 4px;
    font-family: 'Cinzel', serif;
  }
</style>
</head>
<body>
  <div class="grain"></div>
  <div class="frame"></div>
  <div class="copy ${shot.layout === "split-gear" || shot.layout === "vs" ? "" : ""}">
    <div class="pill">AVATAR · FIGHT</div>
    <h1>${heading}</h1>
    <div class="sub">${shot.sub}</div>
  </div>
  <div class="stage">${stage}</div>
</body></html>`;
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  for (const shot of SHOTS) {
    const page = await ctx.newPage();
    const content = await html(shot);
    await page.setContent(content, { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    const out = path.join(OUT, shot.file);
    await page.screenshot({ path: out, type: "png", omitBackground: false });
    console.log(`✓ ${shot.file}`);
    await page.close();
  }
  await browser.close();
})();
