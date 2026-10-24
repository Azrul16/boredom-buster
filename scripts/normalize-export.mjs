import { readdir, copyFile } from "node:fs/promises";
import path from "node:path";

// Next.js segment exports can retain Windows path separators in filenames.
// Emit the dotted aliases requested by the client router, without altering HTML.
async function flattenSegments(directory, destination, prefix) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const source = path.join(directory, entry.name);
    const name = `${prefix}.${entry.name}`;
    if (entry.isDirectory()) await flattenSegments(source, destination, name);
    else await copyFile(source, path.join(destination, name));
  }
}
async function visit(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const child = path.join(directory, entry.name);
    if (entry.name.startsWith("__next."))
      await flattenSegments(child, directory, entry.name);
    else await visit(child);
  }
}
await visit(path.resolve("out"));
