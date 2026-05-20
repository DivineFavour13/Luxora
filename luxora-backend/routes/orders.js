const express = require("express");
const { db, nextId } = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
router.use(authMiddleware);

// POST /api/orders
router.post("/", (req, res) => {
  const { items } = req.body;
  const userId = req.user.id;

  if (!items || !Array.isArray(items) || items.length === 0)
    return res.status(400).json({ error: "Order must contain at least one item" });

  // Calculate total from item details sent by the frontend
  let total = 0;
  const resolvedItems = items.map((item) => {
    const quantity = item.quantity || 1;
    const price = item.price || 0;
    total += price * quantity;
    return {
      productId: item.productId,
      name: item.name || `Product ${item.productId}`,
      quantity,
      price,
    };
  });

  const orderId = nextId("orders");
  const order = {
    id: orderId,
    user_id: userId,
    total,
    status: "pending",
    created_at: new Date().toISOString(),
  };

  db.get("orders").push(order).write();

  for (const item of resolvedItems) {
    const itemId = nextId("orderItems");
    db.get("orderItems")
      .push({
        id: itemId,
        order_id: orderId,
        product_id: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })
      .write();
  }

  res.status(201).json({ message: "Order placed successfully", orderId, total });
});

// GET /api/orders
router.get("/", (req, res) => {
  const orders = db.get("orders").filter({ user_id: req.user.id }).value();

  const result = orders.map((order) => {
    const items = db
      .get("orderItems")
      .filter({ order_id: order.id })
      .value()
      .map((item) => ({
        ...item,
        name: item.name || `Product ${item.product_id}`,
      }));
    return { ...order, items };
  });

  res.json(result);
});

// GET /api/orders/:id
router.get("/:id", (req, res) => {
  const order = db
    .get("orders")
    .find({ id: parseInt(req.params.id), user_id: req.user.id })
    .value();

  if (!order) return res.status(404).json({ error: "Order not found" });

  const items = db
    .get("orderItems")
    .filter({ order_id: order.id })
    .value()
    .map((item) => ({
      ...item,
      name: item.name || `Product ${item.product_id}`,
    }));

  res.json({ ...order, items });
});

module.exports = router;