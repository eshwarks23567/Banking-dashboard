const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

exports.registerUser = (req, res) => {
  const { name, email, password, account_number, account_type } = req.body;

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.query(
    "INSERT INTO Users (name, email, password, account_number) VALUES (?, ?, ?, ?)",
    [name, email, hashedPassword, account_number],
    (err, result) => {
      if (err) return res.status(500).json(err);

      const userId = result.insertId;
      db.query(
        "INSERT INTO Accounts (user_id, balance, account_type) VALUES (?, 0.00, ?)",
        [userId, account_type],
        (err) => {
          if (err) return res.status(500).json(err);
          res.status(200).json({ message: "User registered successfully" });
        }
      );
    }
  );
};

exports.loginUser = (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM Users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) return res.status(404).json("User not found");

    const user = results[0];
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) return res.status(401).json("Incorrect password");

    const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({ token, userId: user.user_id });
  });
};
