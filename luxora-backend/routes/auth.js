const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { db, nextId } = require("../db");

const router = express.Router();

// POST /api/auth/register
router.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ error: "Name, email, and password are required" });

  if (password.length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters" });

  const existing = db.get("users").find({ email }).value();
  if (existing) return res.status(409).json({ error: "Email already in use" });

  const id = nextId("users");
  const hashed = bcrypt.hashSync(password, 10);
  const user = { id, name, email, password: hashed, created_at: new Date().toISOString() };

  db.get("users").push(user).write();

  const token = jwt.sign({ id, name, email }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.status(201).json({ token, user: { id, name, email } });
});

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });

  const user = db.get("users").find({ email }).value();
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

module.exports = router;
