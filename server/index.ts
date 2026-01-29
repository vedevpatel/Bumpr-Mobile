import express from "express";
import type { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import * as path from "path";

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : "*",
  credentials: true,
}));

// Logging
app.use(morgan("combined"));

// Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Helper to determine active interface for logging
import { networkInterfaces } from "os";

(async () => {
  // Register API Routes
  const server = await registerRoutes(app);

  // Global Error Handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error(err);
    if (!res.headersSent) {
      res.status(status).json({ message });
    }
  });

  // Health Check
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "healthy", uptime: process.uptime() });
  });

  const port = parseInt(process.env.PORT || "5000", 10);

  server.listen(port, "0.0.0.0", () => {
    console.log(`\n🚀 Server running in ${process.env.NODE_ENV || "development"} mode on port ${port}`);

    // Log available IPs for convenience
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]!) {
        if (net.family === 'IPv4' && !net.internal) {
          console.log(`   ➜ Local:   http://${net.address}:${port}`);
        }
      }
    }
  });
})();
