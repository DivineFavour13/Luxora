const express = require("express");
const { db } = require("../db");

const router = express.Router();

// GET /api/products/categories/list  (must be before /:id)
router.get("/categories/list", (req, res) => {
  const products = db.get("products").value();
  const categories = [...new Set(products.map((p) => p.category))];
  res.json(categories);
});

// GET /api/products?category=&search=
router.get("/", (req, res) => {
  const { category, search } = req.query;
  let products = db.get("products").value();

  if (category) {
    products = products.filter((p) => p.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    products = products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
    );
  }

  res.json(products);
});

// GET /api/products/:id
router.get("/:id", (req, res) => {
  const product = db.get("products").find({ id: parseInt(req.params.id) }).value();
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

module.exports = router;
