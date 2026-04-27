#!/usr/bin/env node
// Generate character combination art: 5 chars × 3 armors × 3 weapons.
// Output: assets/generated/combos/<char>__<armor>__<weapon>.png  (armor/weapon may be "none")
// 5 + 15 + 15 + 45 = 80 total images. Base 5 already exist, so this script generates 75.

import fs from "node:fs/promises";
import path from "node:path";

const KEY = process.env.OPENAI_API_KEY;
if (!KEY) {
  console.error("OPENAI_API_KEY not set");
  process.exit(1);
}

const OUT_DIR = path.resolve(process.cwd(), "assets/generated/combos");
await fs.mkdir(OUT_DIR, { recursive: true });

const STYLE_BASE = "chibi anime fantasy RPG character, full body, big head small body proportions, soft cel-shaded painted style, warm saturated colors, fantasy mobile-game art, transparent background, centered, no text, single character, standing pose facing the viewer";

const CHARS = {
  knight:  "a young chibi knight boy with bright blonde hair, friendly determined expression",
  ninja:   "a young chibi ninja girl with long black hair tied back and a red headband, athletic stance",
  mage:    "a young chibi wizard girl with bright pink hair and a purple pointed wizard hat, big curious eyes",
  archer:  "a young chibi archer boy with brown spiky hair and a green hood, confident expression",
  vampire: "a young chibi vampire girl with white hair, red eyes, small fangs, mysterious smile",
};

const ARMORS = {
  none:    "wearing only a simple plain tunic with no armor",
  leather: "wearing a brown leather chest piece with visible stitching over a plain tunic",
  chain:   "wearing a silver chainmail vest with a leather underlayer",
  plate:   "wearing heavy steel plate armor with golden trim and a glowing red gem in the center of the chest",
};

const WEAPONS = {
  none:  "hands empty at sides, no weapon",
  sword: "holding a glowing steel longsword with a golden hilt in the right hand, blade pointing up",
  bow:   "holding an enchanted longbow of polished wood with a faint blue magic glow in the left hand",
  staff: "holding a wooden wizard staff with a glowing purple crystal orb mounted at the top",
};

const ARMOR_KEYS = ["none", "leather", "chain", "plate"]; // 4 armors total but we only generate the 3 non-none + none
const WEAPON_KEYS = ["none", "sword", "bow", "staff"];
const CHAR_KEYS = Object.keys(CHARS);

const ITEMS = [];
for (const c of CHAR_KEYS) {
  for (const a of ARMOR_KEYS) {
    for (const w of WEAPON_KEYS) {
      // Skip the all-none case (we already have 5 base char images)
      if (a === "none" && w === "none") continue;
      const name = `${c}__${a}__${w}`;
      const prompt = `${STYLE_BASE}. ${CHARS[c]}, ${ARMORS[a]}, ${WEAPONS[w]}.`;
      ITEMS.push({ name, prompt });
    }
  }
}

console.log(`Total combos to generate: ${ITEMS.length}`);

async function fileExists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function generate(item) {
  const file = path.join(OUT_DIR, `${item.name}.png`);
  if (await fileExists(file)) {
    console.log(`· skip (exists) ${item.name}`);
    return file;
  }
  const body = {
    model: "gpt-image-1",
    prompt: item.prompt,
    n: 1,
    size: "1024x1024",
    quality: "medium",
    background: "transparent",
    output_format: "png",
  };
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${item.name}: ${res.status} ${text.slice(0, 300)}`);
  }
  const data = await res.json();
  const b64 = data.data[0].b64_json;
  const buf = Buffer.from(b64, "base64");
  await fs.writeFile(file, buf);
  console.log(`✓ ${item.name} (${(buf.length / 1024).toFixed(0)}kb)`);
  return file;
}

async function main() {
  const concurrency = 3;
  let done = 0;
  let failed = 0;
  for (let i = 0; i < ITEMS.length; i += concurrency) {
    const batch = ITEMS.slice(i, i + concurrency);
    const r = await Promise.allSettled(batch.map(generate));
    for (const x of r) {
      if (x.status === "rejected") { console.error(`✗ ${x.reason.message}`); failed++; }
      else done++;
    }
    console.log(`progress: ${i + batch.length}/${ITEMS.length}`);
  }
  console.log(`\nDone. Generated/skipped: ${done}  Failed: ${failed}`);
  if (failed > 0) {
    console.log(`Re-run the script to retry only the failed ones (existing files are skipped).`);
    process.exit(1);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
