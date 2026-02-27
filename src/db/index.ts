import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const dbPath = process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "portfolio.db");
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL UNIQUE,
    path TEXT NOT NULL,
    size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    uploaded_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

export interface VideoRow {
  id: number;
  filename: string;
  path: string;
  size: number;
  mime_type: string;
  uploaded_at: string;
}

export function insertVideo(
  filename: string,
  path: string,
  size: number,
  mimeType: string
): VideoRow {
  const stmt = db.prepare(
    `INSERT INTO videos (filename, path, size, mime_type) VALUES (?, ?, ?, ?) RETURNING *`
  );
  return stmt.get(filename, path, size, mimeType) as VideoRow;
}

export function listVideos(): VideoRow[] {
  const stmt = db.prepare(
    `SELECT id, filename, path, size, mime_type, uploaded_at FROM videos ORDER BY uploaded_at DESC`
  );
  return stmt.all() as VideoRow[];
}

export function getVideoByFilename(filename: string): VideoRow | undefined {
  const stmt = db.prepare(`SELECT * FROM videos WHERE filename = ?`);
  return stmt.get(filename) as VideoRow | undefined;
}

export function getVideoById(id: number): VideoRow | undefined {
  const stmt = db.prepare(`SELECT * FROM videos WHERE id = ?`);
  return stmt.get(id) as VideoRow | undefined;
}

export function deleteVideoByFilename(filename: string): boolean {
  const stmt = db.prepare(`DELETE FROM videos WHERE filename = ?`);
  const result = stmt.run(filename);
  return result.changes > 0;
}

export function deleteVideoById(id: number): boolean {
  const stmt = db.prepare(`DELETE FROM videos WHERE id = ?`);
  const result = stmt.run(id);
  return result.changes > 0;
}
