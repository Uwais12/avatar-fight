#!/usr/bin/env node
// Generate the App Store icon (1024×1024 RGB PNG, no alpha) using gpt-image-1.
// Apple requires: square, no transparency, no rounded corners (iOS adds the mask).

import fs from "node:fs/promises";
import path from "node:path";

const KEY = process.env.OPENAI_API_KEY;
if (!KEY) {
  console.error("OPENAI_API_KEY not set");
  process.exit(1);
}

const OUT_DIR = path.resolve(process.cwd(), "assets/generated");
await fs.mkdir(OUT_DIR, { recursive: true });

const prompt = [
  "App Store icon for a chibi-anime fantasy mobile RPG called Avatar Fight.",
  "Centered emblem composition: a heroic chibi knight portrait (just head and shoulders, big head proportions, friendly determined eyes, blonde hair) in front of two crossed glowing swords.",
  "Behind the knight: a circular medieval banner / crest in deep crimson red (#b22e22) with thick gold trim (#d4a23a), set against a warm parchment-colored background (#e7d29c) with subtle woven texture.",
  "Bold cel-shaded painted style. High contrast. Strong silhouette readable at tiny sizes.",
  "No text. No letters. No numbers. No watermark.",
  "Square 1:1 composition. Edge-to-edge artwork (no padding/border) — fills the entire image.",
  "Fully opaque flat background, no transparency.",
].join(" ");

const body = {
  model: "gpt-image-1",
  prompt,
  n: 1,
  size: "1024x1024",
  quality: "high",
  background: "opaque",
  output_format: "png",
};

const res = await fetch("https://api.openai.com/v1/images/generations", {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
  body: JSON.stringify(body),
});

if (!res.ok) {
  console.error(await res.text());
  process.exit(1);
}

const data = await res.json();
const buf = Buffer.from(data.data[0].b64_json, "base64");
const file = path.join(OUT_DIR, "app-icon-1024.png");
await fs.writeFile(file, buf);
console.log(`✓ ${file} (${(buf.length / 1024).toFixed(0)}kb)`);
