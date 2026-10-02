import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const snapshot = readFileSync(
  new URL("../docs/brand/upstream/colors_and_type.css", import.meta.url),
  "utf8",
);
const manifest = JSON.parse(
  readFileSync(
    new URL("../docs/brand/upstream/snapshot.json", import.meta.url),
    "utf8",
  ),
);
if (createHash("sha256").update(snapshot).digest("hex") !== manifest.sha256) {
  console.error(
    "Design snapshot digest mismatch. Review and update snapshot provenance.",
  );
  process.exit(1);
}
const tokens = (source) =>
  new Map(
    [
      ...source
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .matchAll(/(--sp-[\w-]+)\s*:\s*([^;\n]+)/g),
    ].map(([, key, value]) => [key, value.trim()]),
  );
const upstream = tokens(snapshot);
const local = tokens(
  readFileSync(new URL("../src/styles/tokens.css", import.meta.url), "utf8"),
);
const differences = [...upstream].filter(
  ([key, value]) => local.get(key) !== value,
);
if (differences.length) {
  for (const [key, value] of differences)
    console.error(
      `${key}: expected ${value}; got ${local.get(key) ?? "missing"}`,
    );
  process.exit(1);
}
console.log(
  `✓ ${upstream.size} shared design tokens match the verified snapshot`,
);
