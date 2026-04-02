const fs = require("fs");
const path = require("path");

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const port = parseInt(process.env.PORT || "8787", 10);
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.disable("x-powered-by");
app.use(express.json({ limit: "100kb" }));
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // curl/postman/same-origin
      if (allowedOrigins.length === 0) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("CORS: origin not allowed"));
    },
  })
);

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "gymwebsite-backend" });
});

app.get("/api/classes", (req, res) => {
  res.json({
    classes: [
      { id: "strength", name: "Strength Training", durationMinutes: 60, level: "All" },
      { id: "hiit", name: "HIIT", durationMinutes: 45, level: "Intermediate" },
      { id: "yoga", name: "Yoga", durationMinutes: 60, level: "All" }
    ],
  });
});

app.get("/api/memberships", (req, res) => {
  res.json({
    memberships: [
      { id: "basic", name: "Basic", priceMonthlyUsd: 29, features: ["Gym access"] },
      { id: "plus", name: "Plus", priceMonthlyUsd: 49, features: ["Gym access", "Classes"] },
      { id: "pro", name: "Pro", priceMonthlyUsd: 79, features: ["Gym access", "Classes", "Personal training (1x/week)"] }
    ],
  });
});

function isEmail(value) {
  if (typeof value !== "string") return false;
  if (value.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

app.post("/api/contact", (req, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";

  if (name.length < 2 || name.length > 80) {
    return res.status(400).json({ ok: false, error: "Invalid name" });
  }
  if (!isEmail(email)) {
    return res.status(400).json({ ok: false, error: "Invalid email" });
  }
  if (message.length < 5 || message.length > 2000) {
    return res.status(400).json({ ok: false, error: "Invalid message" });
  }

  const now = new Date();
  const entry = {
    id: `${now.getTime()}-${Math.random().toString(16).slice(2)}`,
    createdAt: now.toISOString(),
    name,
    email,
    message,
    userAgent: req.get("user-agent") || null,
  };

  const dataDir = path.join(__dirname, "..", "data");
  const outFile = path.join(dataDir, "contacts.jsonl");
  try {
    fs.mkdirSync(dataDir, { recursive: true });
    fs.appendFileSync(outFile, JSON.stringify(entry) + "\n", { encoding: "utf8" });
  } catch (e) {
    return res.status(500).json({ ok: false, error: "Failed to save message" });
  }

  return res.status(201).json({ ok: true, id: entry.id });
});

app.use((err, req, res, next) => {
  // eslint-disable-next-line no-unused-vars
  const _ = next;
  const status = err && err.message && err.message.startsWith("CORS:") ? 403 : 500;
  res.status(status).json({ ok: false, error: status === 403 ? "Origin not allowed" : "Server error" });
});

app.listen(port, () => {
  console.log(`[backend] listening on http://localhost:${port}`);
  if (allowedOrigins.length > 0) console.log(`[backend] allowed origins: ${allowedOrigins.join(", ")}`);
});

