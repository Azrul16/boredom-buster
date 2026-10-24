import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("out");
const files = [];
async function visit(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await visit(file);
    else if (!entry.name.includes("\\") && !/\.(map)$/.test(entry.name)) {
      const relative = path.relative(root, file).split(path.sep).join("/");
      if (relative !== "sw.js" && relative !== "_headers") files.push(relative);
    }
  }
}
await visit(root);
files.sort();
const hash = createHash("sha256");
const urls = [];
for (const file of files) {
  hash.update(file);
  hash.update(await readFile(path.join(root, file)));
  const url = "/" + file.split("/").map(encodeURIComponent).join("/");
  urls.push(url);
  if (url.endsWith("/index.html")) urls.push(url.slice(0, -10));
}
const cacheName = `boredom-buster-${hash.digest("hex").slice(0, 16)}`;
await writeFile(
  path.join(root, "sw.js"),
  `// Generated from the complete static export. Do not edit.
const CACHE = ${JSON.stringify(cacheName)};
const URLS = ${JSON.stringify(urls)};
self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Limit simultaneous downloads; installation succeeds only with the full app.
    for (let i = 0; i < URLS.length; i += 24) {
      await cache.addAll(URLS.slice(i, i + 24).map(url => new Request(url, { cache: "reload" })));
    }
  })());
  // Let an update wait until existing tabs close, keeping each build consistent.
});
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith("boredom-buster-") && name !== CACHE) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    let pathname = url.pathname;
    if (event.request.mode === "navigate" && !pathname.endsWith("/") && !pathname.split("/").pop().includes(".")) pathname += "/";
    const cached = await cache.match(pathname);
    return cached || fetch(event.request);
  })());
});
`,
);
console.log(`Offline cache generated: ${urls.length} URLs (${cacheName}).`);
