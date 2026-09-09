import { cpSync, existsSync, readdirSync } from "node:fs";
import { join, basename, dirname } from "node:path";

const OUT = "out";

function findNextDirs(root) {
  const found = [];
  for (const name of readdirSync(root, { withFileTypes: true })) {
    if (!name.isDirectory()) continue;
    const full = join(root, name.name);
    if (name.name.startsWith("__next.")) found.push(full);
    found.push(...findNextDirs(full));
  }
  return found;
}

let any = true;
while (any) {
  any = false;
  for (const dir of findNextDirs(OUT)) {
    const prefix = basename(dir);
    const parent = dirname(dir);
    for (const child of readdirSync(dir, { withFileTypes: true })) {
      const dest = join(parent, `${prefix}.${child.name}`);
      if (!existsSync(dest)) {
        cpSync(join(dir, child.name), dest, { recursive: true });
        any = true;
      }
    }
  }
}