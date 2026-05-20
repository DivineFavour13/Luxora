require("dotenv").config();
const express = require("express");
const cors = require("cors");

require("./db"); // Initialize DB on startup

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/users", require("./routes/users"));

app.get("/", (req, res) => {
  res.json({ message: "LUXORA API is running ✨" });
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong" });
});

app.listen(PORT, () => {
  console.log(`🚀 LUXORA backend running on http://localhost:${PORT}`);
});
