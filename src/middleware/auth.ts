import { Request, Response, NextFunction } from "express";
import { config } from "../config";

/**
 * Optional admin auth: if ADMIN_API_KEY is set, require X-Admin-Key header.
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!config.adminApiKey) {
    next();
    return;
  }
  const key = req.headers["x-admin-key"];
  if (key !== config.adminApiKey) {
    res.status(401).json({ error: "Unauthorized: invalid or missing X-Admin-Key" });
    return;
  }
  next();
}
