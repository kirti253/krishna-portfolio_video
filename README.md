# Krishna Portfolio – Video API

Node.js TypeScript API for uploading videos as an admin. Uploaded videos are **saved to a SQLite database** (metadata) and to disk (files), and served so they can be used directly in your portfolio.

## Setup

```bash
npm install
```

## Run

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

Server runs at **http://localhost:3000** by default. Set `PORT` to change it.

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/videos` | List all videos from database (for portfolio) |
| `GET` | `/api/videos/:id` | Get one video by id |
| `POST` | `/api/videos/upload` | Upload a video (saved to DB + disk) |
| `DELETE` | `/api/videos/id/:id` | Delete a video by id (admin) |
| `DELETE` | `/api/videos/:filename` | Delete a video by filename (admin) |

Videos are streamed at: **`/videos/:filename`**. Database (SQLite) stores: `id`, `filename`, `path`, `size`, `mime_type`, `uploaded_at`.

## Upload (Admin)

Send a **multipart/form-data** request with field name **`video`**:

```bash
curl -X POST http://localhost:3000/api/videos/upload \
  -F "video=@/path/to/your/video.mp4"
```

With optional admin key (if `ADMIN_API_KEY` is set):

```bash
curl -X POST http://localhost:3000/api/videos/upload \
  -H "X-Admin-Key: your-secret-key" \
  -F "video=@/path/to/your/video.mp4"
```

**Allowed formats:** MP4, WebM, QuickTime, AVI, WMV.  
**Max size:** 500 MB (override with `MAX_VIDEO_SIZE` in bytes).

## Use in portfolio

1. **List videos:** `GET /api/videos` → `{ "videos": [{ "id", "name", "url", "size", "mimeType", "uploadedAt" }] }`
2. **Play a video:** Use `url` from the list, e.g. `http://localhost:3000/videos/my-video-123.mp4`

Example in HTML:

```html
<video src="http://localhost:3000/videos/my-video-123.mp4" controls></video>
```

## Environment (optional)

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 3000) |
| `ADMIN_API_KEY` | If set, upload/delete require `X-Admin-Key` header |
| `UPLOAD_DIR` | Folder for video files (default: `public/videos`) |
| `MAX_VIDEO_SIZE` | Max file size in bytes (default: 524288000 = 500MB) |
| `DATABASE_PATH` | SQLite database file (default: `data/portfolio.db`) |
