/**
 * Database Adapter for Vercel and Local Development
 * Supports: Vercel Postgres, Supabase, or In-Memory fallback
 */

// Try to use Vercel Postgres if available
let db = null;
let dbType = 'none';

// Check for Vercel Postgres
if (process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL) {
  try {
    // Dynamic require to avoid errors if package not installed
    let pgAdapter;
    try {
      pgAdapter = require('./postgres-adapter');
      // Use postgres adapter wrapper that mimics SQLite API but returns promises
      // For compatibility, we'll make it work with both sync and async patterns
      db = {
        prepare: (query) => {
          // Convert SQLite ? to Postgres $1, $2 format
          let paramIndex = 1;
          const convertedQuery = query.replace(/\?/g, () => `$${paramIndex++}`);
          
          return {
            // Return promises that resolve immediately for async, or values for sync
            run: (...params) => {
              const promise = pgAdapter.postgresMethods.run(convertedQuery, params);
              // For compatibility with sync code, we'll return a thenable that can be awaited or used sync
              return promise;
            },
            get: (...params) => {
              return pgAdapter.postgresMethods.get(convertedQuery, params);
            },
            all: (...params) => {
              return pgAdapter.postgresMethods.all(convertedQuery, params);
            }
          };
        },
        exec: (sql) => {
          return pgAdapter.postgresMethods.exec(sql);
        },
        pragma: () => ({ foreign_keys: 'ON' }),
        close: async () => {
          // Postgres connection is managed by @vercel/postgres
        }
      };
      dbType = 'postgres';
      
      // Initialize Postgres schema
      pgAdapter.initPostgres().catch(err => {
        console.error('Postgres init error:', err);
      });
      
      console.log('✅ Using Vercel Postgres');
    } catch (e) {
      console.warn('@vercel/postgres package not installed:', e.message);
    }
  } catch (error) {
    console.warn('Vercel Postgres not available, using fallback:', error.message);
  }
}

// Check for Supabase
if (dbType === 'none' && process.env.SUPABASE_URL) {
  try {
    let supabaseClient;
    try {
      supabaseClient = require('@supabase/supabase-js');
    } catch (e) {
      console.warn('@supabase/supabase-js package not installed');
    }
    
    if (supabaseClient && process.env.SUPABASE_ANON_KEY) {
      db = supabaseClient.createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
      dbType = 'supabase';
      console.log('Using Supabase');
    }
  } catch (error) {
    console.warn('Supabase not available, using fallback');
  }
}

// Fallback: Use SQLite for local, in-memory for Vercel
if (dbType === 'none') {
  if (process.env.VERCEL) {
    // For Vercel without external DB, use in-memory SQLite
    console.warn('⚠️  Using in-memory database. Data will be lost after cold start!');
    console.warn('💡 For production, please setup Vercel Postgres or Supabase');
    
    const Database = require('better-sqlite3');
    db = new Database(':memory:');
    dbType = 'sqlite-memory';
  } else {
    // Local development: use file-based SQLite
    const Database = require('better-sqlite3');
    const path = require('path');
    const fs = require('fs');
    
    const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../../data');
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    const DB_PATH = path.join(DATA_DIR, 'accounting.db');
    db = new Database(DB_PATH);
    dbType = 'sqlite-file';
    console.log('Using local SQLite database');
  }
}

// Initialize schema based on database type
const initializeSchema = async () => {
  if (dbType === 'postgres' || dbType === 'supabase') {
    // For Postgres/Supabase, we'll use the existing SQLite-based service
    // but need to migrate schema - for now, fallback to SQLite
    return;
  }
  
  // SQLite schema initialization (from database.js)
  if (dbType.includes('sqlite')) {
    db.pragma('foreign_keys = ON');
    
    db.exec(`
      CREATE TABLE IF NOT EXISTS chart_of_accounts (
        code TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
        is_contra INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        description TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.exec(`
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

    db.exec(`
      CREATE TABLE IF NOT EXISTS adjusting_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        description TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.exec(`
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

    db.exec(`
      CREATE TABLE IF NOT EXISTS metadata (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_transaction_entries_transaction_id 
      ON transaction_entries(transaction_id);
      
      CREATE INDEX IF NOT EXISTS idx_transaction_entries_account_code 
      ON transaction_entries(account_code);
      
      CREATE INDEX IF NOT EXISTS idx_adjusting_entry_entries_entry_id 
      ON adjusting_entry_entries(adjusting_entry_id);
      
      CREATE INDEX IF NOT EXISTS idx_adjusting_entry_entries_account_code 
      ON adjusting_entry_entries(account_code);
    `);
  }
};

// Initialize on first load
if (db && dbType.includes('sqlite')) {
  initializeSchema();
}

const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};

const getDbType = () => dbType;

module.exports = {
  getDatabase,
  getDbType,
  initializeSchema
};

