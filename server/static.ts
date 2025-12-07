import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function serveStatic(app: Express) {
  // In production, serve from dist/public (relative to project root)
  // The server runs from project root, so we go up from server/ to find dist/
  const distPath = path.resolve(__dirname, "..", "dist", "public");

  console.log("Static files path:", distPath);
  console.log("Path exists:", fs.existsSync(distPath));

  if (!fs.existsSync(distPath)) {
    console.error(`Build directory not found: ${distPath}`);
    // Don't crash - just skip static file serving
    return;
  }

  // Check if index.html exists
  const indexPath = path.resolve(distPath, "index.html");
  console.log("index.html exists:", fs.existsSync(indexPath));

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("Frontend not built. Run npm run build first.");
    }
  });
}
