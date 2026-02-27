import fs from "fs";
import path from "path";

export function ensureUploadDir(dir: string): void {
  const absolute = path.isAbsolute(dir) ? dir : path.join(process.cwd(), dir);
  if (!fs.existsSync(absolute)) {
    fs.mkdirSync(absolute, { recursive: true });
  }
}
