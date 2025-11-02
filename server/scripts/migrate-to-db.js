/**
 * Migration script to migrate data from JSON files to SQLite database
 * Run this once to migrate existing data
 */

const fs = require('fs');
const path = require('path');
const { getDatabase } = require('../services/database');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../../data');
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'transactions.json');
const ADJUSTING_ENTRIES_FILE = path.join(DATA_DIR, 'adjusting-entries.json');
const COA_FILE = path.join(DATA_DIR, 'chart-of-accounts.json');
const METADATA_FILE = path.join(DATA_DIR, 'metadata.json');

const readJsonFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
  }
  return null;
};

const migrate = () => {
  const db = getDatabase();
  
  console.log('Starting migration from JSON files to SQLite database...');
  
  // Migrate Chart of Accounts
  const coaData = readJsonFile(COA_FILE);
  if (coaData) {
    console.log('Migrating Chart of Accounts...');
    const insertCOA = db.prepare(`
      INSERT OR IGNORE INTO chart_of_accounts (code, name, type, is_contra)
      VALUES (?, ?, ?, ?)
    `);
    
    const allAccounts = [
      ...(coaData.assets || []),
      ...(coaData.liabilities || []),
      ...(coaData.equity || []),
      ...(coaData.revenue || []),
      ...(coaData.expenses || [])
    ];
    
    for (const account of allAccounts) {
      try {
        insertCOA.run(
          account.code,
          account.name,
          account.type,
          account.isContra ? 1 : 0
        );
      } catch (error) {
        console.error(`Error migrating account ${account.code}:`, error.message);
      }
    }
    console.log(`Migrated ${allAccounts.length} accounts`);
  }
  
  // Migrate Transactions
  const transactionsData = readJsonFile(TRANSACTIONS_FILE);
  if (transactionsData && Array.isArray(transactionsData) && transactionsData.length > 0) {
    console.log('Migrating Transactions...');
    const insertTrans = db.prepare(`
      INSERT INTO transactions (id, date, description)
      VALUES (?, ?, ?)
    `);
    const insertEntry = db.prepare(`
      INSERT INTO transaction_entries (transaction_id, account_code, debit, credit)
      VALUES (?, ?, ?, ?)
    `);
    
    let count = 0;
    for (const trans of transactionsData) {
      try {
        insertTrans.run(trans.id, trans.date, trans.description);
        for (const entry of trans.entries || []) {
          insertEntry.run(trans.id, entry.account, entry.debit || 0, entry.credit || 0);
        }
        count++;
      } catch (error) {
        console.error(`Error migrating transaction ${trans.id}:`, error.message);
      }
    }
    console.log(`Migrated ${count} transactions`);
  }
  
  // Migrate Adjusting Entries
  const adjustingEntriesData = readJsonFile(ADJUSTING_ENTRIES_FILE);
  if (adjustingEntriesData && Array.isArray(adjustingEntriesData) && adjustingEntriesData.length > 0) {
    console.log('Migrating Adjusting Entries...');
    const insertAdj = db.prepare(`
      INSERT INTO adjusting_entries (id, date, description)
      VALUES (?, ?, ?)
    `);
    const insertAdjEntry = db.prepare(`
      INSERT INTO adjusting_entry_entries (adjusting_entry_id, account_code, debit, credit)
      VALUES (?, ?, ?, ?)
    `);
    
    let count = 0;
    for (const entry of adjustingEntriesData) {
      try {
        insertAdj.run(entry.id, entry.date, entry.description);
        for (const e of entry.entries || []) {
          insertAdjEntry.run(entry.id, e.account, e.debit || 0, e.credit || 0);
        }
        count++;
      } catch (error) {
        console.error(`Error migrating adjusting entry ${entry.id}:`, error.message);
      }
    }
    console.log(`Migrated ${count} adjusting entries`);
  }
  
  // Migrate Metadata
  const metadataData = readJsonFile(METADATA_FILE);
  if (metadataData) {
    console.log('Migrating Metadata...');
    const insertMeta = db.prepare('INSERT OR REPLACE INTO metadata (key, value) VALUES (?, ?)');
    
    for (const [key, value] of Object.entries(metadataData)) {
      try {
        insertMeta.run(key, typeof value === 'object' ? JSON.stringify(value) : value);
      } catch (error) {
        console.error(`Error migrating metadata key ${key}:`, error.message);
      }
    }
    console.log('Migrated metadata');
  }
  
  console.log('Migration completed!');
  console.log('Note: JSON files are kept as backup. You can delete them after verifying the migration.');
};

// Run migration
if (require.main === module) {
  migrate();
}

module.exports = { migrate };

