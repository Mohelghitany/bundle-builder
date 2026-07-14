const express = require("express");
const products = require("../../data/products.json");
const { processCheckout } = require("../services/checkout");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

router.get("/catalog", (req, res) => {
  res.set("Cache-Control", "public, max-age=300");
  res.json(products);
});

router.post("/checkout", (req, res) => {
  const outcome = processCheckout(req.body);
  if (outcome.error) {
    return res.status(outcome.status).json({
      error: outcome.error,
      code: outcome.code,
      missing: outcome.missing,
    });
  }
  return res.status(outcome.status).json(outcome.result);
});

module.exports = router;
