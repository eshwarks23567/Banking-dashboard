const express = require("express");
const db = require("../db");
const router = express.Router();

// Get user by ID
router.get("/:id", (req, res) => {
  const userId = req.params.id;
  db.query("SELECT * FROM Users WHERE user_id = ?", [userId], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) return res.status(404).json("User not found");
    res.json(results[0]);
  });
});

module.exports = router;
