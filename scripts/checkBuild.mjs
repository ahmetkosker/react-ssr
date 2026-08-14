import { existsSync, readdirSync } from "node:fs";

const requiredFiles = [
  "src/server/build/server.js",
  "src/client/dist/bundle.css",
];

const missing = requiredFiles.filter((file) => !existsSync(file));

const hasClientBundles =
  existsSync("src/client/dist") &&
  readdirSync("src/client/dist", { recursive: true }).some((entry) =>
    String(entry).endsWith(".js"),
  );

if (missing.length > 0 || !hasClientBundles) {
  console.error("Compiled assets are missing:");
  for (const file of missing) {
    console.error(`  - ${file}`);
  }
  if (!hasClientBundles) {
    console.error("  - src/client/dist (no client bundles)");
  }
  console.error('Run "yarn build" first.');
  process.exit(1);
}
