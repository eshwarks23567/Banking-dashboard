const express = require("express");
const router = express.Router();
const pool = require("../db");

// ✅ Create a new account
router.post("/", async (req, res) => {
  const { userId } = req.body;
  const account_number = "ACC" + Math.floor(1000000000 + Math.random() * 9000000000);
  const account_type = "Savings";
  const balance = 0;

  try {
    const [result] = await pool.query(
      "INSERT INTO Accounts (user_id, account_number, account_type, balance) VALUES (?, ?, ?, ?)",
      [userId, account_number, account_type, balance]
    );

    res.status(201).json({
      account_id: result.insertId,
      user_id: userId,
      account_number,
      account_type,
      balance,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get account details by userId
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM Accounts WHERE user_id = ?", [userId]);
    if (!rows.length) return res.status(404).json({ error: "Account not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get transactions by account ID
router.get("/transactions/:accountId", async (req, res) => {
  const { accountId } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM Transactions WHERE account_id = ? ORDER BY timestamp DESC",
      [accountId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get transfers by sender account ID
router.get("/transfers/:accountId", async (req, res) => {
  const { accountId } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM Transfers WHERE sender_account_id = ? ORDER BY timestamp DESC",
      [accountId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Deposit into account
router.post("/deposit", async (req, res) => {
  const { accountId, amount } = req.body;
  try {
    await pool.query("UPDATE Accounts SET balance = balance + ? WHERE account_id = ?", [amount, accountId]);
    await pool.query("INSERT INTO Transactions (account_id, amount, type) VALUES (?, ?, 'credit')", [accountId, amount]);
    res.json({ message: "Deposit successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Transfer between accounts
router.post("/transfer", async (req, res) => {
  const { senderId, receiverAccountId, amount } = req.body;
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    await conn.query("UPDATE Accounts SET balance = balance - ? WHERE account_id = ?", [amount, senderId]);
    await conn.query("UPDATE Accounts SET balance = balance + ? WHERE account_number = ?", [amount, receiverAccountId]);

    const [receiver] = await conn.query("SELECT account_id FROM Accounts WHERE account_number = ?", [receiverAccountId]);
    if (!receiver.length) throw new Error("Receiver account not found");

    await conn.query(
      "INSERT INTO Transfers (sender_account_id, receiver_account_id, amount) VALUES (?, ?, ?)",
      [senderId, receiver[0].account_id, amount]
    );

    await conn.query("INSERT INTO Transactions (account_id, amount, type) VALUES (?, ?, 'debit')", [senderId, amount]);

    await conn.commit();
    res.json({ message: "Transfer successful" });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
