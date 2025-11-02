const { getDatabase } = require('./database');

// Helper to get database connection
const db = () => getDatabase();

// Chart of Accounts - Get all accounts grouped by type
const getChartOfAccounts = () => {
  const database = db();
  const accounts = database.prepare('SELECT * FROM chart_of_accounts ORDER BY code').all();
  
  const result = {
    assets: [],
    liabilities: [],
    equity: [],
    revenue: [],
    expenses: []
  };
  
  accounts.forEach(acc => {
    const account = {
      code: acc.code,
      name: acc.name,
      type: acc.type,
      isContra: acc.is_contra === 1
    };
    
    switch (acc.type) {
      case 'asset':
        result.assets.push(account);
        break;
      case 'liability':
        result.liabilities.push(account);
        break;
      case 'equity':
        result.equity.push(account);
        break;
      case 'revenue':
        result.revenue.push(account);
        break;
      case 'expense':
        result.expenses.push(account);
        break;
    }
  });
  
  return result;
};

// CRUD Operations for Chart of Accounts
const addAccount = (account) => {
  const { code, name, type, isContra } = account;
  
  if (!code || !name || !type) {
    throw new Error('Account must have code, name, and type');
  }
  
  const database = db();
  
  // Check if code already exists
  const existing = database.prepare('SELECT code FROM chart_of_accounts WHERE code = ?').get(code);
  if (existing) {
    throw new Error(`Account code ${code} already exists`);
  }
  
  // Insert new account
  try {
    database.prepare(`
      INSERT INTO chart_of_accounts (code, name, type, is_contra)
      VALUES (?, ?, ?, ?)
    `).run(code, name, type, isContra ? 1 : 0);
    
    return { code, name, type, isContra: isContra || false };
  } catch (error) {
    throw new Error(`Failed to add account: ${error.message}`);
  }
};

const updateAccount = (code, account) => {
  const { name, type, isContra } = account;
  
  if (!name || !type) {
    throw new Error('Account must have name and type');
  }
  
  const database = db();
  
  // Check if account exists
  const existing = database.prepare('SELECT code FROM chart_of_accounts WHERE code = ?').get(code);
  if (!existing) {
    throw new Error('Account not found');
  }
  
  // Update account
  try {
    database.prepare(`
      UPDATE chart_of_accounts 
      SET name = ?, type = ?, is_contra = ?, updated_at = CURRENT_TIMESTAMP
      WHERE code = ?
    `).run(name, type, isContra ? 1 : 0, code);
    
    return { code, name, type, isContra: isContra || false };
  } catch (error) {
    throw new Error(`Failed to update account: ${error.message}`);
  }
};

const deleteAccount = (code) => {
  const database = db();
  
  // Check if account exists
  const existing = database.prepare('SELECT code FROM chart_of_accounts WHERE code = ?').get(code);
  if (!existing) {
    throw new Error('Account not found');
  }
  
  // Check if account is used in transactions or adjusting entries
  const usedInTransactions = database.prepare(`
    SELECT COUNT(*) as count FROM transaction_entries WHERE account_code = ?
  `).get(code);
  
  const usedInAdjustments = database.prepare(`
    SELECT COUNT(*) as count FROM adjusting_entry_entries WHERE account_code = ?
  `).get(code);
  
  if (usedInTransactions.count > 0 || usedInAdjustments.count > 0) {
    throw new Error(`Cannot delete account ${code}: Account is used in transactions or adjusting entries`);
  }
  
  // Delete account
  try {
    database.prepare('DELETE FROM chart_of_accounts WHERE code = ?').run(code);
    return true;
  } catch (error) {
    throw new Error(`Failed to delete account: ${error.message}`);
  }
};

// CRUD Operations for Transactions
const getTransactions = () => {
  const database = db();
  
  const transactions = database.prepare(`
    SELECT id, date, description 
    FROM transactions 
    ORDER BY date, id
  `).all();
  
  return transactions.map(trans => {
    const entries = database.prepare(`
      SELECT account_code as account, debit, credit
      FROM transaction_entries
      WHERE transaction_id = ?
      ORDER BY id
    `).all(trans.id);
    
    return {
      id: trans.id,
      date: trans.date,
      description: trans.description,
      entries: entries.map(e => ({
        account: e.account,
        debit: e.debit || 0,
        credit: e.credit || 0
      }))
    };
  });
};

const addTransaction = (transaction) => {
  const { date, description, entries } = transaction;
  
  if (!date || !description || !entries || entries.length < 2) {
    throw new Error('Invalid transaction: must have date, description, and at least 2 entries');
  }
  
  // Validate double-entry bookkeeping
  const totalDebit = entries.reduce((sum, e) => sum + (e.debit || 0), 0);
  const totalCredit = entries.reduce((sum, e) => sum + (e.credit || 0), 0);
  
  if (totalDebit !== totalCredit) {
    throw new Error(`Unbalanced transaction: Debit ${totalDebit} ≠ Credit ${totalCredit}`);
  }
  
  const database = db();
  
  try {
    // Begin transaction
    const insertTransaction = database.prepare(`
      INSERT INTO transactions (date, description)
      VALUES (?, ?)
    `);
    
    const insertEntry = database.prepare(`
      INSERT INTO transaction_entries (transaction_id, account_code, debit, credit)
      VALUES (?, ?, ?, ?)
    `);
    
    const insertTransactionMany = database.transaction((transactions) => {
      for (const trans of transactions) {
        const result = insertTransaction.run(trans.date, trans.description);
        const transactionId = result.lastInsertRowid;
        
        for (const entry of trans.entries) {
          insertEntry.run(
            transactionId,
            entry.account,
            entry.debit || 0,
            entry.credit || 0
          );
        }
      }
    });
    
    const result = insertTransaction.run(date, description);
    const transactionId = result.lastInsertRowid;
    
    for (const entry of entries) {
      // Verify account exists
      const account = database.prepare('SELECT code FROM chart_of_accounts WHERE code = ?').get(entry.account);
      if (!account) {
        throw new Error(`Account ${entry.account} does not exist`);
      }
      
      insertEntry.run(
        transactionId,
        entry.account,
        entry.debit || 0,
        entry.credit || 0
      );
    }
    
    return {
      id: transactionId,
      date,
      description,
      entries
    };
  } catch (error) {
    throw new Error(`Failed to add transaction: ${error.message}`);
  }
};

const updateTransaction = (id, transaction) => {
  const { date, description, entries } = transaction;
  
  if (!date || !description || !entries || entries.length < 2) {
    throw new Error('Invalid transaction: must have date, description, and at least 2 entries');
  }
  
  // Validate double-entry bookkeeping
  const totalDebit = entries.reduce((sum, e) => sum + (e.debit || 0), 0);
  const totalCredit = entries.reduce((sum, e) => sum + (e.credit || 0), 0);
  
  if (totalDebit !== totalCredit) {
    throw new Error(`Unbalanced transaction: Debit ${totalDebit} ≠ Credit ${totalCredit}`);
  }
  
  const database = db();
  
  // Check if transaction exists
  const existing = database.prepare('SELECT id FROM transactions WHERE id = ?').get(id);
  if (!existing) {
    throw new Error('Transaction not found');
  }
  
  try {
    // Update transaction
    database.prepare(`
      UPDATE transactions 
      SET date = ?, description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(date, description, id);
    
    // Delete old entries
    database.prepare('DELETE FROM transaction_entries WHERE transaction_id = ?').run(id);
    
    // Insert new entries
    const insertEntry = database.prepare(`
      INSERT INTO transaction_entries (transaction_id, account_code, debit, credit)
      VALUES (?, ?, ?, ?)
    `);
    
    for (const entry of entries) {
      // Verify account exists
      const account = database.prepare('SELECT code FROM chart_of_accounts WHERE code = ?').get(entry.account);
      if (!account) {
        throw new Error(`Account ${entry.account} does not exist`);
      }
      
      insertEntry.run(
        id,
        entry.account,
        entry.debit || 0,
        entry.credit || 0
      );
    }
    
    return {
      id,
      date,
      description,
      entries
    };
  } catch (error) {
    throw new Error(`Failed to update transaction: ${error.message}`);
  }
};

const deleteTransaction = (id) => {
  const database = db();
  
  // Check if transaction exists
  const existing = database.prepare('SELECT id FROM transactions WHERE id = ?').get(id);
  if (!existing) {
    throw new Error('Transaction not found');
  }
  
  try {
    // Delete entries first (foreign key cascade should handle this, but explicit is better)
    database.prepare('DELETE FROM transaction_entries WHERE transaction_id = ?').run(id);
    
    // Delete transaction
    database.prepare('DELETE FROM transactions WHERE id = ?').run(id);
    
    return true;
  } catch (error) {
    throw new Error(`Failed to delete transaction: ${error.message}`);
  }
};

// CRUD Operations for Adjusting Entries
const getAdjustingEntries = () => {
  const database = db();
  
  const entries = database.prepare(`
    SELECT id, date, description 
    FROM adjusting_entries 
    ORDER BY date, id
  `).all();
  
  return entries.map(entry => {
    const entryEntries = database.prepare(`
      SELECT account_code as account, debit, credit
      FROM adjusting_entry_entries
      WHERE adjusting_entry_id = ?
      ORDER BY id
    `).all(entry.id);
    
    return {
      id: entry.id,
      date: entry.date,
      description: entry.description,
      entries: entryEntries.map(e => ({
        account: e.account,
        debit: e.debit || 0,
        credit: e.credit || 0
      }))
    };
  });
};

const addAdjustingEntry = (entry) => {
  const { date, description, entries } = entry;
  
  if (!date || !description || !entries || entries.length < 2) {
    throw new Error('Invalid adjusting entry: must have date, description, and at least 2 entries');
  }
  
  // Validate double-entry bookkeeping
  const totalDebit = entries.reduce((sum, e) => sum + (e.debit || 0), 0);
  const totalCredit = entries.reduce((sum, e) => sum + (e.credit || 0), 0);
  
  if (totalDebit !== totalCredit) {
    throw new Error(`Unbalanced entry: Debit ${totalDebit} ≠ Credit ${totalCredit}`);
  }
  
  const database = db();
  
  try {
    // Insert adjusting entry
    const result = database.prepare(`
      INSERT INTO adjusting_entries (date, description)
      VALUES (?, ?)
    `).run(date, description);
    
    const entryId = result.lastInsertRowid;
    
    // Insert entries
    const insertEntryEntry = database.prepare(`
      INSERT INTO adjusting_entry_entries (adjusting_entry_id, account_code, debit, credit)
      VALUES (?, ?, ?, ?)
    `);
    
    for (const e of entries) {
      // Verify account exists
      const account = database.prepare('SELECT code FROM chart_of_accounts WHERE code = ?').get(e.account);
      if (!account) {
        throw new Error(`Account ${e.account} does not exist`);
      }
      
      insertEntryEntry.run(
        entryId,
        e.account,
        e.debit || 0,
        e.credit || 0
      );
    }
    
    return {
      id: entryId,
      date,
      description,
      entries
    };
  } catch (error) {
    throw new Error(`Failed to add adjusting entry: ${error.message}`);
  }
};

const updateAdjustingEntry = (id, entry) => {
  const { date, description, entries } = entry;
  
  if (!date || !description || !entries || entries.length < 2) {
    throw new Error('Invalid adjusting entry: must have date, description, and at least 2 entries');
  }
  
  // Validate double-entry bookkeeping
  const totalDebit = entries.reduce((sum, e) => sum + (e.debit || 0), 0);
  const totalCredit = entries.reduce((sum, e) => sum + (e.credit || 0), 0);
  
  if (totalDebit !== totalCredit) {
    throw new Error(`Unbalanced entry: Debit ${totalDebit} ≠ Credit ${totalCredit}`);
  }
  
  const database = db();
  
  // Check if entry exists
  const existing = database.prepare('SELECT id FROM adjusting_entries WHERE id = ?').get(id);
  if (!existing) {
    throw new Error('Adjusting entry not found');
  }
  
  try {
    // Update adjusting entry
    database.prepare(`
      UPDATE adjusting_entries 
      SET date = ?, description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(date, description, id);
    
    // Delete old entries
    database.prepare('DELETE FROM adjusting_entry_entries WHERE adjusting_entry_id = ?').run(id);
    
    // Insert new entries
    const insertEntryEntry = database.prepare(`
      INSERT INTO adjusting_entry_entries (adjusting_entry_id, account_code, debit, credit)
      VALUES (?, ?, ?, ?)
    `);
    
    for (const e of entries) {
      // Verify account exists
      const account = database.prepare('SELECT code FROM chart_of_accounts WHERE code = ?').get(e.account);
      if (!account) {
        throw new Error(`Account ${e.account} does not exist`);
      }
      
      insertEntryEntry.run(
        id,
        e.account,
        e.debit || 0,
        e.credit || 0
      );
    }
    
    return {
      id,
      date,
      description,
      entries
    };
  } catch (error) {
    throw new Error(`Failed to update adjusting entry: ${error.message}`);
  }
};

const deleteAdjustingEntry = (id) => {
  const database = db();
  
  // Check if entry exists
  const existing = database.prepare('SELECT id FROM adjusting_entries WHERE id = ?').get(id);
  if (!existing) {
    throw new Error('Adjusting entry not found');
  }
  
  try {
    // Delete entries first
    database.prepare('DELETE FROM adjusting_entry_entries WHERE adjusting_entry_id = ?').run(id);
    
    // Delete adjusting entry
    database.prepare('DELETE FROM adjusting_entries WHERE id = ?').run(id);
    
    return true;
  } catch (error) {
    throw new Error(`Failed to delete adjusting entry: ${error.message}`);
  }
};

// Calculate all account balances
const calculateAccountBalances = () => {
  const accounts = getChartOfAccounts();
  const transactions = getTransactions();
  const adjustments = getAdjustingEntries();
  
  const allAccounts = [
    ...accounts.assets,
    ...accounts.liabilities,
    ...accounts.equity,
    ...accounts.revenue,
    ...accounts.expenses
  ];
  
  const balances = {};
  
  // Initialize all accounts
  allAccounts.forEach(acc => {
    balances[acc.code] = {
      code: acc.code,
      name: acc.name,
      type: acc.type,
      isContra: acc.isContra || false,
      debit: 0,
      credit: 0,
      balance: 0
    };
  });
  
  // Process regular transactions
  transactions.forEach(trans => {
    trans.entries.forEach(entry => {
      if (balances[entry.account]) {
        balances[entry.account].debit += entry.debit;
        balances[entry.account].credit += entry.credit;
      }
    });
  });
  
  // Process adjusting entries
  adjustments.forEach(adj => {
    adj.entries.forEach(entry => {
      if (balances[entry.account]) {
        balances[entry.account].debit += entry.debit;
        balances[entry.account].credit += entry.credit;
      }
    });
  });
  
  // Calculate balances
  allAccounts.forEach(acc => {
    const bal = balances[acc.code];
    if (acc.type === 'asset' || acc.type === 'expense') {
      bal.balance = bal.debit - bal.credit;
    } else if (acc.type === 'liability' || acc.type === 'equity' || acc.type === 'revenue') {
      bal.balance = bal.credit - bal.debit;
    }
  });
  
  return balances;
};

// Calculate all reports
const calculateReports = () => {
  const balances = calculateAccountBalances();
  const accounts = getChartOfAccounts();
  
  // S3 - Trial Balance (Neraca Saldo)
  const trialBalance = Object.values(balances)
    .filter(acc => acc.debit > 0 || acc.credit > 0)
    .map(acc => ({
      account: acc.code,
      name: acc.name,
      debit: acc.debit,
      credit: acc.credit
    }));
  
  // S4 - Adjusted Trial Balance
  const adjustedTrialBalance = Object.values(balances)
    .filter(acc => acc.balance !== 0 || acc.debit > 0 || acc.credit > 0)
    .map(acc => ({
      account: acc.code,
      name: acc.name,
      debit: acc.debit,
      credit: acc.credit,
      balance: acc.balance
    }));
  
  // S5 - Income Statement
  const revenues = accounts.revenue.map(acc => ({
    account: acc.code,
    name: acc.name,
    amount: balances[acc.code] ? balances[acc.code].balance : 0
  }));
  
  const expenses = accounts.expenses.map(acc => ({
    account: acc.code,
    name: acc.name,
    amount: balances[acc.code] ? balances[acc.code].balance : 0
  }));
  
  const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netIncome = totalRevenue - totalExpenses;
  
  // S6 - Statement of Financial Position
  const assets = accounts.assets.map(acc => ({
    account: acc.code,
    name: acc.name,
    amount: balances[acc.code] ? balances[acc.code].balance : 0
  }));
  
  const liabilities = accounts.liabilities.map(acc => ({
    account: acc.code,
    name: acc.name,
    amount: balances[acc.code] ? balances[acc.code].balance : 0
  }));
  
  const equityItems = accounts.equity.map(acc => ({
    account: acc.code,
    name: acc.name,
    amount: balances[acc.code] ? balances[acc.code].balance : 0
  }));
  
  // Calculate totals for financial position
  const totalAssets = assets.reduce((sum, a) => sum + (a.amount || 0), 0);
  const totalLiabilities = liabilities.reduce((sum, l) => sum + (l.amount || 0), 0);
  
  // For equity in financial position:
  const initialCapital = equityItems
    .filter(e => e.account === '3-101' || e.account === '3-102')
    .reduce((sum, e) => sum + (e.amount || 0), 0);
  const retainedEarnings = equityItems.find(e => e.account === '3-200')?.amount || 0;
  const totalEquity = initialCapital + retainedEarnings + netIncome;
  
  // S7 - Statement of Changes in Equity
  const initialAminCapital = 60000000;
  const initialFawziCapital = 40000000;
  const totalInitialCapital = initialAminCapital + initialFawziCapital;
  
  const retainedEarningsBalance = balances['3-200'] ? balances['3-200'].balance : 0;
  const finalRetainedEarnings = retainedEarningsBalance + netIncome;
  
  const equityChanges = [
    {
      description: 'Modal Awal Amin',
      amount: initialAminCapital
    },
    {
      description: 'Modal Awal Fawzi',
      amount: initialFawziCapital
    },
    {
      description: 'Total Modal Awal',
      amount: totalInitialCapital
    },
    {
      description: 'Laba Bersih',
      amount: netIncome
    },
    {
      description: 'Total Ekuitas (31 Januari 2024)',
      amount: totalEquity
    }
  ];
  
  return {
    trialBalance,
    adjustedTrialBalance,
    incomeStatement: {
      revenues,
      expenses,
      totalRevenue,
      totalExpenses,
      netIncome
    },
    financialPosition: {
      assets,
      liabilities,
      equity: equityItems,
      totalAssets,
      totalLiabilities,
      totalEquity,
      netIncome
    },
    changesInEquity: equityChanges
  };
};

// Metadata functions
const defaultMetadata = {
  companyName: 'CV ABC',
  reportTitle: 'Sistem Akuntansi CV ABC',
  period: 'Januari 2024',
  periodDetail: 'Bulan Januari 2024',
  createdBy: '',
  date: new Date().toISOString().split('T')[0]
};

const getMetadata = () => {
  const database = db();
  
  const metadata = database.prepare('SELECT * FROM metadata').all();
  const result = { ...defaultMetadata };
  
  metadata.forEach(row => {
    try {
      result[row.key] = JSON.parse(row.value);
    } catch {
      result[row.key] = row.value;
    }
  });
  
  return result;
};

const updateMetadata = (metadata) => {
  const database = db();
  const currentMetadata = getMetadata();
  const updatedMetadata = {
    ...currentMetadata,
    ...metadata,
    date: metadata.date || currentMetadata.date || new Date().toISOString().split('T')[0]
  };
  
  // Save all metadata keys
  const insert = database.prepare('INSERT INTO metadata (key, value) VALUES (?, ?)');
  const update = database.prepare('UPDATE metadata SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?');
  const check = database.prepare('SELECT key FROM metadata WHERE key = ?');
  
  for (const [key, value] of Object.entries(updatedMetadata)) {
    const exists = check.get(key);
    const valueStr = typeof value === 'object' ? JSON.stringify(value) : value;
    
    if (exists) {
      update.run(valueStr, key);
    } else {
      insert.run(key, valueStr);
    }
  }
  
  return updatedMetadata;
};

module.exports = {
  getChartOfAccounts,
  getTransactions,
  getAdjustingEntries,
  calculateAccountBalances,
  calculateReports,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  addAdjustingEntry,
  updateAdjustingEntry,
  deleteAdjustingEntry,
  getMetadata,
  updateMetadata,
  addAccount,
  updateAccount,
  deleteAccount
};
