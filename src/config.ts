export const config = {
  port: parseInt(process.env.PORT ?? "3000", 10),
  /** Optional: set ADMIN_API_KEY to require X-Admin-Key header on upload/delete */
  adminApiKey: process.env.ADMIN_API_KEY ?? null,
  /** Directory for uploaded videos (relative to project root) */
  uploadDir: process.env.UPLOAD_DIR ?? "public/videos",
  /** Max file size in bytes (default 500MB) */
  maxFileSize: parseInt(process.env.MAX_VIDEO_SIZE ?? "524288000", 10),
  /** Allowed video MIME types */
  allowedMimeTypes: [
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-ms-wmv",
  ],
};
