import http from "node:http";
import dotenv from "dotenv";
import { bot } from "./bot.js";

dotenv.config({ path: ".env" });

const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

// Create HTTP server for health checks
const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

// Start HTTP server
server.listen(Number(PORT), HOST, () => {
  console.log(`Health check server listening on ${HOST}:${PORT}`);

  // Start the Telegram bot after server is ready
  bot.start();
  console.log("Telegram bot started");
});

// Graceful shutdown
const shutdown = async (signal: string) => {
  console.log(`Received ${signal}, shutting down gracefully...`);

  server.close(() => {
    console.log("HTTP server closed");
  });

  await bot.stop();
  console.log("Telegram bot stopped");

  process.exit(0);
};

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
