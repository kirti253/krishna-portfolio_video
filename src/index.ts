import express from "express";
import cors from "cors";
import path from "path";
import { config } from "./config";
import videoRoutes from "./routes/videos";

const app = express();

app.use(cors());
app.use(express.json());

const uploadDir = path.isAbsolute(config.uploadDir)
  ? config.uploadDir
  : path.join(process.cwd(), config.uploadDir);

app.use("/videos", express.static(uploadDir));
app.use("/api/videos", videoRoutes);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  if (err.message?.includes("File too large")) {
    res.status(413).json({ error: "Video file too large" });
    return;
  }
  if (err.message?.includes("Invalid file type")) {
    res.status(400).json({ error: err.message });
    return;
  }
  res.status(500).json({ error: "Internal server error" });
});

app.listen(config.port, () => {
  console.log(`Portfolio video API running at http://localhost:${config.port}`);
  console.log(`  - List videos:  GET  /api/videos`);
  console.log(`  - Upload video: POST /api/videos/upload (field: video)`);
  console.log(`  - Delete video: DELETE /api/videos/:filename`);
  console.log(`  - Stream URL:   /videos/:filename`);
});
