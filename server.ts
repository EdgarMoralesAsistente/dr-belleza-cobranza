import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      app: "Dr. Belleza - Medical & Aesthetic Financing App",
      timestamp: new Date().toISOString()
    });
  });

  // Endpoint para obtener y compartir la URL de Google Apps Script centralizada
  let sharedGasUrl = process.env.VITE_GAS_URL || process.env.GAS_URL || "";

  app.get("/api/gas-config", (req, res) => {
    res.json({
      success: true,
      gasUrl: sharedGasUrl || process.env.VITE_GAS_URL || process.env.GAS_URL || ""
    });
  });

  app.post("/api/gas-config", (req, res) => {
    const { gasUrl } = req.body;
    if (gasUrl && typeof gasUrl === "string") {
      sharedGasUrl = gasUrl.trim();
      return res.json({ success: true, gasUrl: sharedGasUrl });
    }
    return res.status(400).json({ error: "Invalid gasUrl" });
  });

  // Proxy endpoint para Google Apps Script
  app.post("/api/gas-proxy", async (req, res) => {
    const { gasUrl, payload } = req.body;
    if (!gasUrl) {
      return res.status(400).json({ error: "Missing gasUrl" });
    }

    try {
      const response = await fetch(gasUrl, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload || {}),
      });

      const data = await response.json();
      return res.json(data);
    } catch (err: any) {
      console.error("Error in gas-proxy:", err);
      return res.status(500).json({ error: err.message || "Failed to communicate with Apps Script" });
    }
  });

  // Vite middleware in dev mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Dr. Belleza] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
