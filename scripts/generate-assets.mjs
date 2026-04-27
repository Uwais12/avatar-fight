// Generates fantasy chibi RPG art via OpenAI gpt-image-1
// Original characters/creatures designed by us — not copies of any specific game's characters.

import fs from "node:fs";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const KEY = process.env.OPENAI_API_KEY;
if (!KEY) {
  console.error("OPENAI_API_KEY not set");
  process.exit(1);
}

const OUT = path.join(process.cwd(), "assets", "generated");
fs.mkdirSync(OUT, { recursive: true });

const STYLE_BASE = "early 2010s mobile RPG chibi anime style, glossy painted look, vibrant saturated colors, big expressive eyes, cute proportions, full body shown, clean outline, soft cel shading, no background, transparent background, centered character";

const CHARACTERS = [
  { id: "knight", prompt: `young chibi knight boy with brown hair, blue tunic and tan pants, holding a small sword pointed up, friendly determined smile, ${STYLE_BASE}` },
  { id: "ninja", prompt: `chibi female ninja with black hair in ponytail, dark grey ninja outfit with red headband, holding a kunai, sneaky grin, ${STYLE_BASE}` },
  { id: "mage", prompt: `chibi female mage with long lavender hair, purple robe with silver trim, holding a wooden staff topped with a glowing crystal, gentle smile, ${STYLE_BASE}` },
  { id: "archer", prompt: `chibi blonde elf archer girl with green hood and brown leather tunic, holding a wooden bow, sharp focused eyes, ${STYLE_BASE}` },
  { id: "vampire", prompt: `chibi vampire boy with black hair and red eyes, dark red coat with black collar, fangs visible in playful grin, holding a small dagger, ${STYLE_BASE}` },
];

const PETS = [
  { id: "ember-wyrm", prompt: `cute chibi red dragon hatchling with horns and tiny wings, fierce expression, fiery orange-red scales, ${STYLE_BASE}` },
  { id: "frost-drake", prompt: `cute chibi blue dragon with icy crystalline horns and frosty wings, calm expression, cyan and white scales, ${STYLE_BASE}` },
  { id: "war-wolf", prompt: `cute chibi wolf with grey fur and red bandana, fierce loyal expression, sitting upright, ${STYLE_BASE}` },
  { id: "battle-cat", prompt: `cute chibi orange tabby cat with a tiny red cape and golden bell collar, playful pose, ${STYLE_BASE}` },
  { id: "thunder-bird", prompt: `cute chibi golden eagle with sparking blue electric feathers, sharp eyes, wings half-spread, ${STYLE_BASE}` },
];

const WEAPONS = [
  { id: "sword", prompt: "single fantasy RPG icon: shiny iron sword with golden hilt and blue gem in pommel, viewed from front at slight angle, glossy painted style, vibrant colors, soft cel shading, no background, transparent background, centered" },
  { id: "bow", prompt: "single fantasy RPG icon: ornate wooden longbow with carved details and a single silver arrow knocked, glossy painted style, vibrant colors, soft cel shading, no background, transparent background, centered" },
  { id: "staff", prompt: "single fantasy RPG icon: tall wooden mage staff topped with a glowing purple crystal orb wrapped by gold filigree, glossy painted style, vibrant colors, soft cel shading, no background, transparent background, centered" },
];

const ARMORS = [
  { id: "helm", prompt: "single fantasy RPG icon: knight steel helmet with gold trim and red plume, three-quarter view, glossy painted style, vibrant colors, soft cel shading, no background, transparent background, centered" },
  { id: "chest", prompt: "single fantasy RPG icon: ornate steel chestplate with gold filigree and emerald gem inset, glossy painted style, vibrant colors, soft cel shading, no background, transparent background, centered" },
  { id: "boots", prompt: "single fantasy RPG icon: pair of brown leather adventurer boots with gold buckles, glossy painted style, vibrant colors, soft cel shading, no background, transparent background, centered" },
];

async function generateOne({ id, prompt, size = "1024x1024", folder = "characters" }) {
  const outPath = path.join(OUT, folder, `${id}.png`);
  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 1000) {
    console.log(`SKIP ${folder}/${id} (exists)`);
    return;
  }
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  console.log(`GEN  ${folder}/${id}...`);
  const t0 = Date.now();

  const body = {
    model: "gpt-image-1",
    prompt,
    n: 1,
    size,
    background: "transparent",
    output_format: "png",
    quality: "medium",
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
    const txt = await res.text();
    throw new Error(`HTTP ${res.status}: ${txt.slice(0, 300)}`);
  }

  const data = await res.json();
  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) throw new Error("No image data");

  fs.writeFileSync(outPath, Buffer.from(b64, "base64"));
  const dt = ((Date.now() - t0) / 1000).toFixed(1);
  const sz = (fs.statSync(outPath).size / 1024).toFixed(0);
  console.log(`  ✓ ${folder}/${id}  ${dt}s  ${sz}KB`);
}

async function main() {
  const tasks = [
    ...CHARACTERS.map((c) => ({ ...c, folder: "characters", size: "1024x1024" })),
    ...PETS.map((p) => ({ ...p, folder: "pets", size: "1024x1024" })),
    ...WEAPONS.map((w) => ({ ...w, folder: "weapons", size: "1024x1024" })),
    ...ARMORS.map((a) => ({ ...a, folder: "armor", size: "1024x1024" })),
  ];

  console.log(`Generating ${tasks.length} images...`);
  const start = Date.now();

  const concurrency = 3;
  let idx = 0;
  async function worker() {
    while (idx < tasks.length) {
      const t = tasks[idx++];
      try {
        await generateOne(t);
      } catch (e) {
        console.error(`✗ ${t.folder}/${t.id}:`, e.message);
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));

  console.log(`\nDone in ${((Date.now() - start) / 1000).toFixed(0)}s. Output: ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
