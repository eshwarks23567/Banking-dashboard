const express = require("express");
const db = require("../db");
const router = express.Router();

// GET /api/transactions/:accountId?type=credit&start=YYYY-MM-DD&end=YYYY-MM-DD&page=1&limit=10
router.get("/:accountId", (req, res) => {
  const accountId = req.params.accountId;
  const { type, start, end, page = 1, limit = 10 } = req.query;

  let query = "SELECT * FROM Transactions WHERE account_id = ?";
  const values = [accountId];

  // Optional filters
  if (type) {
    query += " AND type = ?";
    values.push(type);
  }

  if (start && end) {
    query += " AND DATE(timestamp) BETWEEN ? AND ?";
    values.push(start, end);
  }

  query += " ORDER BY timestamp DESC LIMIT ? OFFSET ?";
  values.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

  db.query(query, values, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error", details: err });
    res.json(results);
  });
});

module.exports = router;
