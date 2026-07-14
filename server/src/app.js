const express = require("express");
const { applySecurity, apiLimiter } = require("./middleware/security");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const catalogRoutes = require("./routes/catalog");

function createApp() {
  const app = express();

  applySecurity(app);
  app.use(express.json({ limit: "10kb" }));

  app.use("/api", apiLimiter, catalogRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
