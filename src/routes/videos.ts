import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs";
import { config } from "../config";
import { requireAdmin } from "../middleware/auth";
import { uploadVideo } from "../middleware/upload";
import * as db from "../db";

const router = Router();
const uploadDir = path.isAbsolute(config.uploadDir)
  ? config.uploadDir
  : path.join(process.cwd(), config.uploadDir);

/** GET /api/videos – list all videos from database (for portfolio) */
router.get("/", (_req: Request, res: Response) => {
  try {
    const rows = db.listVideos();
    const videos = rows.map((row) => ({
      id: row.id,
      name: row.filename,
      url: `/videos/${row.filename}`,
      size: row.size,
      mimeType: row.mime_type,
      uploadedAt: row.uploaded_at,
    }));
    res.json({ videos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list videos" });
  }
});

/** GET /api/videos/:id – get single video by id */
router.get("/:id", (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid video id" });
    return;
  }
  const row = db.getVideoById(id);
  if (!row) {
    res.status(404).json({ error: "Video not found" });
    return;
  }
  res.json({
    id: row.id,
    name: row.filename,
    url: `/videos/${row.filename}`,
    size: row.size,
    mimeType: row.mime_type,
    uploadedAt: row.uploaded_at,
  });
});

/** POST /api/videos/upload – admin upload (single video), saved to DB + disk */
router.post(
  "/upload",
  requireAdmin,
  uploadVideo.single("video"),
  (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: "No video file provided. Use field name: video" });
      return;
    }
    try {
      const row = db.insertVideo(
        req.file.filename,
        req.file.path,
        req.file.size,
        req.file.mimetype
      );
      res.status(201).json({
        message: "Video uploaded and saved to database",
        video: {
          id: row.id,
          name: row.filename,
          url: `/videos/${row.filename}`,
          size: row.size,
          mimeType: row.mime_type,
          uploadedAt: row.uploaded_at,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to save video to database" });
    }
  }
);

/** DELETE /api/videos/:id – admin delete by id (removes from DB and disk) */
router.delete("/id/:id", requireAdmin, (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid video id" });
    return;
  }
  const row = db.getVideoById(id);
  if (!row) {
    res.status(404).json({ error: "Video not found" });
    return;
  }
  const filePath = path.join(uploadDir, row.filename);
  try {
    db.deleteVideoById(id);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ message: "Video deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete video" });
  }
});

/** DELETE /api/videos/:filename – admin delete by filename (removes from DB and disk) */
router.delete("/:filename", requireAdmin, (req: Request, res: Response) => {
  const { filename } = req.params;
  if (!filename || filename.includes("..") || filename.includes("/")) {
    res.status(400).json({ error: "Invalid filename" });
    return;
  }
  const row = db.getVideoByFilename(filename);
  if (!row) {
    res.status(404).json({ error: "Video not found" });
    return;
  }
  const filePath = path.join(uploadDir, filename);
  try {
    db.deleteVideoByFilename(filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ message: "Video deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete video" });
  }
});

export default router;
