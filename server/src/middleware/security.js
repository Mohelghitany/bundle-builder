const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const config = require("../config");

/**
 * Applies baseline hardening: strips fingerprinting, sets secure headers,
 * enables gzip, and restricts cross-origin access to the configured allowlist.
 */
function applySecurity(app) {
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(compression());

  const corsOptions = {
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (config.corsOrigins.includes(origin)) return callback(null, true);
      const error = new Error("Origin not allowed by CORS");
      error.status = 403;
      return callback(error);
    },
    methods: ["GET", "POST"],
    maxAge: 86400,
  };

  app.use(cors(corsOptions));
}

const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});

module.exports = { applySecurity, apiLimiter };
