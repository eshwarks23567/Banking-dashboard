USE new_schema;
-- USERS TABLE
CREATE TABLE Users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50),
  email VARCHAR(50) UNIQUE,
  password VARCHAR(255)
);

-- ACCOUNTS TABLE
CREATE TABLE Accounts (
  account_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  account_number VARCHAR(50) UNIQUE NOT NULL,
  account_type VARCHAR(20),
  balance DECIMAL(12, 2) DEFAULT 0.00,
  FOREIGN KEY (user_id) REFERENCES Users(user_id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- TRANSACTIONS TABLE
CREATE TABLE Transactions (
  transaction_id INT AUTO_INCREMENT PRIMARY KEY,
  account_id INT NOT NULL,
  amount DECIMAL(10,2),
  type VARCHAR(10), -- 'credit' or 'debit'
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES Accounts(account_id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- TRANSFERS TABLE
CREATE TABLE Transfers (
  transfer_id INT AUTO_INCREMENT PRIMARY KEY,
  sender_account_id INT NOT NULL,
  receiver_account_id INT NOT NULL,
  amount DECIMAL(10,2),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_account_id) REFERENCES Accounts(account_id),
  FOREIGN KEY (receiver_account_id) REFERENCES Accounts(account_id)
);
Select * from Users;
Select * from Accounts;
ALTER TABLE Transactions MODIFY COLUMN type ENUM('credit', 'debit');

