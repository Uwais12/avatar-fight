#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

const KEY = process.env.OPENAI_API_KEY;
if (!KEY) {
  console.error("OPENAI_API_KEY not set");
  process.exit(1);
}

const OUT_DIR = path.resolve(process.cwd(), "assets/generated");
await fs.mkdir(OUT_DIR, { recursive: true });

const STYLE_BASE = "chibi anime fantasy RPG character, full body, big head small body proportions, soft cel-shaded painted style, warm saturated colors, fantasy mobile-game art, transparent background, centered, no text";

const ITEMS = [
  // Characters (5) — full-body chibi
  { name: "char-knight", prompt: `${STYLE_BASE}. A young chibi knight boy with bright blonde hair, wearing simple silver armor and a red cape, holding a small sword, friendly determined expression, standing pose facing forward.` },
  { name: "char-ninja", prompt: `${STYLE_BASE}. A young chibi ninja girl with long black hair tied back, dark blue ninja outfit with red belt, holding a kunai, athletic stance.` },
  { name: "char-mage", prompt: `${STYLE_BASE}. A young chibi wizard girl with bright pink hair and pointed purple wizard hat, blue robes with stars, holding a wooden staff, big curious eyes.` },
  { name: "char-archer", prompt: `${STYLE_BASE}. A young chibi archer boy with brown spiky hair and a green hood, leather tunic, longbow slung over shoulder, confident expression, standing pose.` },
  { name: "char-vampire", prompt: `${STYLE_BASE}. A young chibi vampire girl with white hair and red eyes, black gothic dress with red trim, small fangs visible, bat-wing earrings, mysterious smile.` },

  // Pets (5) — fantasy creature
  { name: "pet-red-dragon", prompt: "Chibi anime fantasy pet, small red dragon with fierce eyes and small wings, painted cel-shaded mobile-game art style, transparent background, full body, centered, looks like a loyal companion creature." },
  { name: "pet-blue-dragon", prompt: "Chibi anime fantasy pet, small blue ice dragon with crystal spikes on back, painted cel-shaded mobile-game art style, transparent background, full body, centered." },
  { name: "pet-wolf", prompt: "Chibi anime fantasy pet, fluffy grey direwolf with golden eyes, painted cel-shaded mobile-game art style, transparent background, full body, sitting alert." },
  { name: "pet-tiger", prompt: "Chibi anime fantasy pet, orange saber-tooth tiger cub with battle stripes, painted cel-shaded mobile-game art style, transparent background, full body, standing." },
  { name: "pet-eagle", prompt: "Chibi anime fantasy pet, golden phoenix-eagle with flame feathers, painted cel-shaded mobile-game art style, transparent background, full body, wings partially spread." },

  // Weapon icons (6) — square inventory icons
  { name: "weapon-sword", prompt: "RPG game weapon icon: glowing steel longsword with golden hilt, painterly fantasy style, dark background with subtle radial glow, centered, single object." },
  { name: "weapon-bow", prompt: "RPG game weapon icon: enchanted longbow made of polished wood with blue magic glow, drawn arrow, painterly fantasy style, dark background, centered, single object." },
  { name: "weapon-staff", prompt: "RPG game weapon icon: wizard staff with glowing purple crystal orb at top, twisted wood, painterly fantasy style, dark background, centered, single object." },
  { name: "weapon-axe", prompt: "RPG game weapon icon: heavy battle-axe with crescent steel blade and wooden handle wrapped in leather, painterly fantasy style, dark background, centered, single object." },
  { name: "weapon-mace", prompt: "RPG game weapon icon: spiked steel mace with golden trim, painterly fantasy style, dark background, centered, single object." },
  { name: "weapon-dagger", prompt: "RPG game weapon icon: curved obsidian dagger with poison-green blade glow, painterly fantasy style, dark background, centered, single object." },

  // Armor icons (4)
  { name: "armor-leather", prompt: "RPG game armor icon: brown leather chest piece with stitching, painterly fantasy style, dark background, centered, single object." },
  { name: "armor-chain", prompt: "RPG game armor icon: silver chainmail vest, painterly fantasy style, dark background, centered, single object." },
  { name: "armor-plate", prompt: "RPG game armor icon: heavy steel plate breastplate with gold trim and red gem, painterly fantasy style, dark background, centered, single object." },
  { name: "armor-robe", prompt: "RPG game armor icon: blue mage robe with silver star embroidery, painterly fantasy style, dark background, centered, single object." },
];

async function generate(item) {
  const isIcon = item.name.startsWith("weapon-") || item.name.startsWith("armor-");
  const body = {
    model: "gpt-image-1",
    prompt: item.prompt,
    n: 1,
    size: "1024x1024",
    quality: "medium",
    background: isIcon ? "auto" : "transparent",
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
  const file = path.join(OUT_DIR, `${item.name}.png`);
  await fs.writeFile(file, buf);
  console.log(`✓ ${item.name} (${(buf.length / 1024).toFixed(0)}kb)`);
  return file;
}

async function main() {
  console.log(`Generating ${ITEMS.length} images to ${OUT_DIR}`);
  const results = [];
  const concurrency = 3;
  for (let i = 0; i < ITEMS.length; i += concurrency) {
    const batch = ITEMS.slice(i, i + concurrency);
    const r = await Promise.allSettled(batch.map(generate));
    for (const x of r) {
      if (x.status === "rejected") console.error(`✗ ${x.reason.message}`);
      else results.push(x.value);
    }
  }
  console.log(`Done: ${results.length}/${ITEMS.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
