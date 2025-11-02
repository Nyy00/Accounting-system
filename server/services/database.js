const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Database file path
const DATA_DIR = process.env.DATA_DIR || (
  process.env.VERCEL ? '/tmp' : path.join(__dirname, '../../data')
);

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'accounting.db');

// Initialize database connection
let db;

const getDatabase = () => {
  if (!db) {
    db = new Database(DB_PATH);
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    initializeSchema();
  }
  return db;
};

// Initialize database schema
const initializeSchema = () => {
  const database = getDatabase();
  
  // Chart of Accounts table
  database.exec(`
    CREATE TABLE IF NOT EXISTS chart_of_accounts (
      code TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
      is_contra INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Transactions table
  database.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Transaction entries table (for double-entry bookkeeping)
  database.exec(`
    CREATE TABLE IF NOT EXISTS transaction_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_id INTEGER NOT NULL,
      account_code TEXT NOT NULL,
      debit REAL DEFAULT 0,
      credit REAL DEFAULT 0,
      FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
      FOREIGN KEY (account_code) REFERENCES chart_of_accounts(code),
      CHECK((debit = 0 AND credit > 0) OR (credit = 0 AND debit > 0))
    )
  `);

  // Adjusting entries table
  database.exec(`
    CREATE TABLE IF NOT EXISTS adjusting_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Adjusting entry entries table
  database.exec(`
    CREATE TABLE IF NOT EXISTS adjusting_entry_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      adjusting_entry_id INTEGER NOT NULL,
      account_code TEXT NOT NULL,
      debit REAL DEFAULT 0,
      credit REAL DEFAULT 0,
      FOREIGN KEY (adjusting_entry_id) REFERENCES adjusting_entries(id) ON DELETE CASCADE,
      FOREIGN KEY (account_code) REFERENCES chart_of_accounts(code),
      CHECK((debit = 0 AND credit > 0) OR (credit = 0 AND debit > 0))
    )
  `);

  // Metadata table
  database.exec(`
    CREATE TABLE IF NOT EXISTS metadata (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for better performance
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_transaction_entries_transaction_id 
    ON transaction_entries(transaction_id);
    
    CREATE INDEX IF NOT EXISTS idx_transaction_entries_account_code 
    ON transaction_entries(account_code);
    
    CREATE INDEX IF NOT EXISTS idx_adjusting_entry_entries_entry_id 
    ON adjusting_entry_entries(adjusting_entry_id);
    
    CREATE INDEX IF NOT EXISTS idx_adjusting_entry_entries_account_code 
    ON adjusting_entry_entries(account_code);
  `);
};

// Close database connection (for cleanup)
const closeDatabase = () => {
  if (db) {
    db.close();
    db = null;
  }
};

module.exports = {
  getDatabase,
  closeDatabase,
  initializeSchema
};

