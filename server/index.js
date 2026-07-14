const createApp = require("./src/app");
const config = require("./src/config");

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`API running on http://localhost:${config.port} (${config.nodeEnv})`);
});

function shutdown(signal) {
  console.log(`\n${signal} received, shutting down gracefully.`);
  server.close(() => process.exit(0));
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

module.exports = app;
