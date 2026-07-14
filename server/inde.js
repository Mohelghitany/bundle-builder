const express = require("express");
const cors = require("cors");
const products = require("./data/products.json");

const app = express();

app.use(cors());

app.get("/api/products", (req, res) => {
  res.json(products);
});

app.listen(3001, () => {
  console.log("API running on http://localhost:3001");
});