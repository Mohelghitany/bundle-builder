const config = require("../config");

function notFound(req, res) {
  res.status(404).json({ error: "Resource not found" });
}


function errorHandler(err, req, res) {
  const status = err.status || 500;
  if (config.nodeEnv !== "test") {
    console.error(`[error] ${req.method} ${req.originalUrl} ->`, err.message);
  }
  const message = status === 500 ? "Internal server error" : err.message;
  res.status(status).json({ error: message });
}

module.exports = { notFound, errorHandler };
