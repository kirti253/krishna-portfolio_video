import path from "path";
import multer from "multer";
import { config } from "../config";
import { ensureUploadDir } from "../utils/ensureUploadDir";

ensureUploadDir(config.uploadDir);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureUploadDir(config.uploadDir);
    cb(null, config.uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".mp4";
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "-");
    const name = `${base}-${Date.now()}${ext}`;
    cb(null, name);
  },
});

function fileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void {
  if (config.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
    return;
  }
  cb(new Error(`Invalid file type. Allowed: ${config.allowedMimeTypes.join(", ")}`));
}

export const uploadVideo = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.maxFileSize },
});
