const { getDatabase } = require('./database');
const { getDbType } = require('./db-adapter');

// Helper to get database connection
const db = () => getDatabase();

// Helper function to format currency (simple version)
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

// Helper to check if database is async (Postgres/Neon)
const isAsyncDb = () => {
  try {
    const dbType = getDbType();
    // Neon, Vercel Postgres, and Supabase are all async
    return dbType === 'neon' || dbType === 'postgres' || dbType === 'supabase';
  } catch {
    return false;
  }
};

// Helper to run query (sync for SQLite, async for Postgres)
const runQuery = async (queryFn) => {
  if (isAsyncDb()) {
    return await queryFn();
  } else {
    return queryFn();
  }
};

// Chart of Accounts - Get all accounts grouped by type
const getChartOfAccounts = async () => {
  // Always return a valid structure
  const defaultResult = {
    assets: [],
    liabilities: [],
    equity: [],
    revenue: [],
    expenses: []
  };
  
  try {
    const database = db();
    const accountsPromise = database.prepare('SELECT * FROM chart_of_accounts ORDER BY code').all();
    const accounts = isAsyncDb() ? await accountsPromise : accountsPromise;
    
    // Ensure accounts is an array
    const accountsArray = Array.isArray(accounts) ? accounts : [];
    
    console.log(`[getChartOfAccounts] Found ${accountsArray.length} accounts in database`); // Debug log
    
    const result = {
      assets: [],
      liabilities: [],
      equity: [],
      revenue: [],
      expenses: []
    };
    
    accountsArray.forEach(acc => {
      if (!acc || !acc.code || !acc.name || !acc.type) {
        return; // Skip invalid entries
      }
      
      const account = {
        code: acc.code,
        name: acc.name,
        type: acc.type,
        isContra: acc.is_contra === 1 || acc.is_contra === true
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
    
    console.log(`[getChartOfAccounts] Returning:`, {
      assets: result.assets.length,
      liabilities: result.liabilities.length,
      equity: result.equity.length,
      revenue: result.revenue.length,
      expenses: result.expenses.length
    }); // Debug log
    
    return result;
  } catch (error) {
    console.error('Error getting chart of accounts:', error);
    console.error('Error stack:', error.stack); // Debug log
    return defaultResult;
  }
};

// CRUD Operations for Chart of Accounts
const addAccount = async (account) => {
  const { code, name, type, isContra } = account;
  
  if (!code || !name || !type) {
    throw new Error('Account must have code, name, and type');
  }
  
  const database = db();
  
  // Check if code already exists
  const checkQuery = 'SELECT code, name, type FROM chart_of_accounts WHERE code = ?';
  console.log(`[addAccount] Checking if account ${code} exists with query: ${checkQuery}`);
  
  // Prepare statement and execute query
  const existingStmt = database.prepare(checkQuery);
  const existingPromise = existingStmt.get(code);
  
  // Always await - for Neon it's a promise, for SQLite it's a value
  let existing;
  if (isAsyncDb()) {
    // Neon returns a promise, must await
    existing = await existingPromise;
  } else {
    // SQLite returns value directly
    existing = existingPromise;
  }
  
  console.log(`[addAccount] Existing account check result:`, existing);
  console.log(`[addAccount] Existing is truthy:`, !!existing);
  console.log(`[addAccount] Existing type:`, typeof existing);
  if (existing) {
    console.log(`[addAccount] Existing value:`, JSON.stringify(existing));
  }
  
  if (existing) {
    console.log(`[addAccount] Account ${code} already exists in database:`, existing);
    
    // Also check all accounts to see what's in the database
    const allAccountsStmt = database.prepare('SELECT code, name, type FROM chart_of_accounts ORDER BY code');
    const allAccountsPromise = allAccountsStmt.all();
    const allAccounts = await runQuery(() => allAccountsPromise);
    
    const allAccountsArray = Array.isArray(allAccounts) ? allAccounts : [];
    console.log(`[addAccount] Total accounts in database:`, allAccountsArray.length);
    if (allAccountsArray.length > 0) {
      console.log(`[addAccount] First few accounts:`, allAccountsArray.slice(0, 5));
    }
    
    throw new Error(`Account code ${code} already exists`);
  }
  
  // Insert new account
  try {
    console.log(`[addAccount] Inserting account: ${code}, ${name}, ${type}`);
    const runPromise = database.prepare(`
      INSERT INTO chart_of_accounts (code, name, type, is_contra)
      VALUES (?, ?, ?, ?)
    `).run(code, name, type, isContra ? 1 : 0);
    
    const result = await runQuery(() => runPromise);
    console.log(`[addAccount] Insert result:`, result);
    
    // Verify the account was inserted
    const verifyStmt = database.prepare('SELECT * FROM chart_of_accounts WHERE code = ?');
    const verifyPromise = verifyStmt.get(code);
    const verified = await runQuery(() => verifyPromise);
    console.log(`[addAccount] Verified account exists:`, verified ? 'YES' : 'NO');
    
    return { code, name, type, isContra: isContra || false };
  } catch (error) {
    console.error(`[addAccount] Error inserting account ${code}:`, error);
    throw new Error(`Failed to add account: ${error.message}`);
  }
};

const updateAccount = async (code, account) => {
  const { name, type, isContra } = account;
  
  if (!name || !type) {
    throw new Error('Account must have name and type');
  }
  
  const database = db();
  
  // Check if account exists
  const existingPromise = database.prepare('SELECT code FROM chart_of_accounts WHERE code = ?').get(code);
  const existing = isAsyncDb() ? await existingPromise : existingPromise;
  
  if (!existing) {
    throw new Error('Account not found');
  }
  
  // Update account
  try {
    const runPromise = database.prepare(`
      UPDATE chart_of_accounts 
      SET name = ?, type = ?, is_contra = ?, updated_at = CURRENT_TIMESTAMP
      WHERE code = ?
    `).run(name, type, isContra ? 1 : 0, code);
    
    await runQuery(() => runPromise);
    
    return { code, name, type, isContra: isContra || false };
  } catch (error) {
    throw new Error(`Failed to update account: ${error.message}`);
  }
};

const deleteAccount = async (code) => {
  const database = db();
  
  // Check if account exists
  const existingPromise = database.prepare('SELECT code FROM chart_of_accounts WHERE code = ?').get(code);
  const existing = isAsyncDb() ? await existingPromise : existingPromise;
  
  if (!existing) {
    throw new Error('Account not found');
  }
  
  // Check if account is used in transactions or adjusting entries
  const usedInTransactionsPromise = database.prepare(`
    SELECT COUNT(*) as count FROM transaction_entries WHERE account_code = ?
  `).get(code);
  
  const usedInAdjustmentsPromise = database.prepare(`
    SELECT COUNT(*) as count FROM adjusting_entry_entries WHERE account_code = ?
  `).get(code);
  
  const usedInTransactions = isAsyncDb() ? await usedInTransactionsPromise : usedInTransactionsPromise;
  const usedInAdjustments = isAsyncDb() ? await usedInAdjustmentsPromise : usedInAdjustmentsPromise;
  
  if ((usedInTransactions?.count || 0) > 0 || (usedInAdjustments?.count || 0) > 0) {
    throw new Error(`Cannot delete account ${code}: Account is used in transactions or adjusting entries`);
  }
  
  // Delete account
  try {
    const runPromise = database.prepare('DELETE FROM chart_of_accounts WHERE code = ?').run(code);
    await runQuery(() => runPromise);
    return true;
  } catch (error) {
    throw new Error(`Failed to delete account: ${error.message}`);
  }
};

// CRUD Operations for Transactions
const getTransactions = async () => {
  const database = db();
  
  try {
    const transactionsPromise = database.prepare(`
      SELECT id, date, description 
      FROM transactions 
      ORDER BY date, id
    `).all();
    const transactions = isAsyncDb() ? await transactionsPromise : transactionsPromise;
    
    // Ensure transactions is an array
    const transactionsArray = Array.isArray(transactions) ? transactions : [];
    
    if (!transactionsArray || transactionsArray.length === 0) {
      return [];
    }
    
    const result = await Promise.all(transactionsArray.map(async (trans) => {
      const entriesPromise = database.prepare(`
        SELECT account_code as account, debit, credit
        FROM transaction_entries
        WHERE transaction_id = ?
        ORDER BY id
      `).all(trans.id);
      const entries = isAsyncDb() ? await entriesPromise : entriesPromise;
      
      return {
        id: trans.id,
        date: trans.date,
        description: trans.description,
        entries: (Array.isArray(entries) ? entries : []).map(e => ({
          account: e.account,
          debit: e.debit || 0,
          credit: e.credit || 0
        }))
      };
    }));
    
    return result;
  } catch (error) {
    console.error('Error getting transactions:', error);
    return [];
  }
};

const addTransaction = async (transaction) => {
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
    // Insert transaction
    const insertTransactionPromise = database.prepare(`
      INSERT INTO transactions (date, description)
      VALUES (?, ?)
    `).run(date, description);
    
    const result = await runQuery(() => insertTransactionPromise);
    const transactionId = result.lastInsertRowid;
    
    // Insert entries
    const insertEntry = database.prepare(`
      INSERT INTO transaction_entries (transaction_id, account_code, debit, credit)
      VALUES (?, ?, ?, ?)
    `);
    
    for (const entry of entries) {
      // Verify account exists
      const accountPromise = database.prepare('SELECT code FROM chart_of_accounts WHERE code = ?').get(entry.account);
      const account = isAsyncDb() ? await accountPromise : accountPromise;
      
      if (!account) {
        throw new Error(`Account ${entry.account} does not exist`);
      }
      
      const runPromise = insertEntry.run(
        transactionId,
        entry.account,
        entry.debit || 0,
        entry.credit || 0
      );
      await runQuery(() => runPromise);
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

const updateTransaction = async (id, transaction) => {
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
  const existingPromise = database.prepare('SELECT id FROM transactions WHERE id = ?').get(id);
  const existing = isAsyncDb() ? await existingPromise : existingPromise;
  
  if (!existing) {
    throw new Error('Transaction not found');
  }
  
  try {
    // Update transaction
    const updatePromise = database.prepare(`
      UPDATE transactions 
      SET date = ?, description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(date, description, id);
    await runQuery(() => updatePromise);
    
    // Delete old entries
    const deletePromise = database.prepare('DELETE FROM transaction_entries WHERE transaction_id = ?').run(id);
    await runQuery(() => deletePromise);
    
    // Insert new entries
    const insertEntry = database.prepare(`
      INSERT INTO transaction_entries (transaction_id, account_code, debit, credit)
      VALUES (?, ?, ?, ?)
    `);
    
    for (const entry of entries) {
      // Verify account exists
      const accountPromise = database.prepare('SELECT code FROM chart_of_accounts WHERE code = ?').get(entry.account);
      const account = isAsyncDb() ? await accountPromise : accountPromise;
      
      if (!account) {
        throw new Error(`Account ${entry.account} does not exist`);
      }
      
      const runPromise = insertEntry.run(
        id,
        entry.account,
        entry.debit || 0,
        entry.credit || 0
      );
      await runQuery(() => runPromise);
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

const deleteTransaction = async (id) => {
  const database = db();
  
  // Check if transaction exists
  const existingPromise = database.prepare('SELECT id FROM transactions WHERE id = ?').get(id);
  const existing = isAsyncDb() ? await existingPromise : existingPromise;
  
  if (!existing) {
    throw new Error('Transaction not found');
  }
  
  try {
    // Delete entries first (foreign key cascade should handle this, but explicit is better)
    const deleteEntriesPromise = database.prepare('DELETE FROM transaction_entries WHERE transaction_id = ?').run(id);
    await runQuery(() => deleteEntriesPromise);
    
    // Delete transaction
    const deleteTransPromise = database.prepare('DELETE FROM transactions WHERE id = ?').run(id);
    await runQuery(() => deleteTransPromise);
    
    return true;
  } catch (error) {
    throw new Error(`Failed to delete transaction: ${error.message}`);
  }
};

// CRUD Operations for Adjusting Entries
const getAdjustingEntries = async () => {
  const database = db();
  
  try {
    const entriesPromise = database.prepare(`
      SELECT id, date, description 
      FROM adjusting_entries 
      ORDER BY date, id
    `).all();
    const entries = isAsyncDb() ? await entriesPromise : entriesPromise;
    
    // Ensure entries is an array
    const entriesArray = Array.isArray(entries) ? entries : [];
    
    if (!entriesArray || entriesArray.length === 0) {
      return [];
    }
    
    const result = await Promise.all(entriesArray.map(async (entry) => {
      const entryEntriesPromise = database.prepare(`
        SELECT account_code as account, debit, credit
        FROM adjusting_entry_entries
        WHERE adjusting_entry_id = ?
        ORDER BY id
      `).all(entry.id);
      const entryEntries = isAsyncDb() ? await entryEntriesPromise : entryEntriesPromise;
      
      return {
        id: entry.id,
        date: entry.date,
        description: entry.description,
        entries: (Array.isArray(entryEntries) ? entryEntries : []).map(e => ({
          account: e.account,
          debit: e.debit || 0,
          credit: e.credit || 0
        }))
      };
    }));
    
    return result;
  } catch (error) {
    console.error('Error getting adjusting entries:', error);
    return [];
  }
};

const addAdjustingEntry = async (entry) => {
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
    const resultPromise = database.prepare(`
      INSERT INTO adjusting_entries (date, description)
      VALUES (?, ?)
    `).run(date, description);
    
    const result = await runQuery(() => resultPromise);
    const entryId = result.lastInsertRowid;
    
    // Insert entries
    const insertEntryEntry = database.prepare(`
      INSERT INTO adjusting_entry_entries (adjusting_entry_id, account_code, debit, credit)
      VALUES (?, ?, ?, ?)
    `);
    
    for (const e of entries) {
      // Verify account exists
      const accountPromise = database.prepare('SELECT code FROM chart_of_accounts WHERE code = ?').get(e.account);
      const account = isAsyncDb() ? await accountPromise : accountPromise;
      
      if (!account) {
        throw new Error(`Account ${e.account} does not exist`);
      }
      
      const runPromise = insertEntryEntry.run(
        entryId,
        e.account,
        e.debit || 0,
        e.credit || 0
      );
      await runQuery(() => runPromise);
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

const updateAdjustingEntry = async (id, entry) => {
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
  const existingPromise = database.prepare('SELECT id FROM adjusting_entries WHERE id = ?').get(id);
  const existing = isAsyncDb() ? await existingPromise : existingPromise;
  
  if (!existing) {
    throw new Error('Adjusting entry not found');
  }
  
  try {
    // Update adjusting entry
    const updatePromise = database.prepare(`
      UPDATE adjusting_entries 
      SET date = ?, description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(date, description, id);
    await runQuery(() => updatePromise);
    
    // Delete old entries
    const deletePromise = database.prepare('DELETE FROM adjusting_entry_entries WHERE adjusting_entry_id = ?').run(id);
    await runQuery(() => deletePromise);
    
    // Insert new entries
    const insertEntryEntry = database.prepare(`
      INSERT INTO adjusting_entry_entries (adjusting_entry_id, account_code, debit, credit)
      VALUES (?, ?, ?, ?)
    `);
    
    for (const e of entries) {
      // Verify account exists
      const accountPromise = database.prepare('SELECT code FROM chart_of_accounts WHERE code = ?').get(e.account);
      const account = isAsyncDb() ? await accountPromise : accountPromise;
      
      if (!account) {
        throw new Error(`Account ${e.account} does not exist`);
      }
      
      const runPromise = insertEntryEntry.run(
        id,
        e.account,
        e.debit || 0,
        e.credit || 0
      );
      await runQuery(() => runPromise);
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

const deleteAdjustingEntry = async (id) => {
  const database = db();
  
  // Check if entry exists
  const existingPromise = database.prepare('SELECT id FROM adjusting_entries WHERE id = ?').get(id);
  const existing = isAsyncDb() ? await existingPromise : existingPromise;
  
  if (!existing) {
    throw new Error('Adjusting entry not found');
  }
  
  try {
    // Delete entries first
    const deleteEntriesPromise = database.prepare('DELETE FROM adjusting_entry_entries WHERE adjusting_entry_id = ?').run(id);
    await runQuery(() => deleteEntriesPromise);
    
    // Delete adjusting entry
    const deleteEntryPromise = database.prepare('DELETE FROM adjusting_entries WHERE id = ?').run(id);
    await runQuery(() => deleteEntryPromise);
    
    return true;
  } catch (error) {
    throw new Error(`Failed to delete adjusting entry: ${error.message}`);
  }
};

// Closing Entries - Close revenue and expense accounts to retained earnings
const createClosingEntries = async (date, description) => {
  const database = db();
  const accounts = await getChartOfAccounts();
  const balances = await calculateAccountBalances();
  
  // Get all revenue and expense accounts with non-zero balances
  const revenueAccounts = (accounts.revenue || []).filter(acc => {
    const balance = balances[acc.code] ? balances[acc.code].balance : 0;
    return balance !== 0;
  });
  
  const expenseAccounts = (accounts.expenses || []).filter(acc => {
    const balance = balances[acc.code] ? balances[acc.code].balance : 0;
    return balance !== 0;
  });
  
  if (revenueAccounts.length === 0 && expenseAccounts.length === 0) {
    throw new Error('Tidak ada akun revenue atau expense yang perlu ditutup');
  }
  
  // Check if retained earnings account (3-200) exists
  const retainedEarningsAccount = accounts.equity?.find(e => e.code === '3-200');
  if (!retainedEarningsAccount) {
    throw new Error('Akun Laba Ditahan (3-200) tidak ditemukan. Silakan tambahkan terlebih dahulu.');
  }
  
  const closingEntries = [];
  
  try {
    // Close revenue accounts (debit revenue, credit retained earnings)
    let totalRevenueClosed = 0;
    for (const revenueAcc of revenueAccounts) {
      const balance = balances[revenueAcc.code] ? balances[revenueAcc.code].balance : 0;
      if (balance > 0) {
        // For revenue: debit the account to close it, credit retained earnings
        closingEntries.push({
          account: revenueAcc.code,
          debit: balance,
          credit: 0
        });
        closingEntries.push({
          account: '3-200', // Retained Earnings
          debit: 0,
          credit: balance
        });
        totalRevenueClosed += balance;
      }
    }
    
    // Close expense accounts (credit expense, debit retained earnings)
    let totalExpenseClosed = 0;
    for (const expenseAcc of expenseAccounts) {
      const balance = balances[expenseAcc.code] ? balances[expenseAcc.code].balance : 0;
      if (balance > 0) {
        // For expenses: credit the account to close it, debit retained earnings
        closingEntries.push({
          account: expenseAcc.code,
          debit: 0,
          credit: balance
        });
        closingEntries.push({
          account: '3-200', // Retained Earnings
          debit: balance,
          credit: 0
        });
        totalExpenseClosed += balance;
      }
    }
    
    if (closingEntries.length === 0) {
      throw new Error('Tidak ada akun yang perlu ditutup');
    }
    
    // Validate double-entry (should be balanced)
    const totalDebit = closingEntries.reduce((sum, e) => sum + (e.debit || 0), 0);
    const totalCredit = closingEntries.reduce((sum, e) => sum + (e.credit || 0), 0);
    
    if (totalDebit !== totalCredit) {
      throw new Error(`Unbalanced closing entries: Debit ${totalDebit} ≠ Credit ${totalCredit}`);
    }
    
    // Create closing entry as adjusting entry
    const closingDesc = description || `Penutupan Akun Sementara - Revenue: ${formatCurrency(totalRevenueClosed)}, Expense: ${formatCurrency(totalExpenseClosed)}`;
    const entry = await addAdjustingEntry({
      date: date || new Date().toISOString().split('T')[0],
      description: closingDesc,
      entries: closingEntries
    });
    
    return {
      entry,
      revenueAccountsClosed: revenueAccounts.length,
      expenseAccountsClosed: expenseAccounts.length,
      totalRevenueClosed,
      totalExpenseClosed,
      netIncome: totalRevenueClosed - totalExpenseClosed
    };
  } catch (error) {
    throw new Error(`Failed to create closing entries: ${error.message}`);
  }
};

// Calculate all account balances
const calculateAccountBalances = async () => {
  let accounts, transactions, adjustments;
  
  try {
    accounts = await getChartOfAccounts();
    transactions = await getTransactions();
    adjustments = await getAdjustingEntries();
  } catch (error) {
    console.error('Error fetching data for balance calculation:', error);
    accounts = { assets: [], liabilities: [], equity: [], revenue: [], expenses: [] };
    transactions = [];
    adjustments = [];
  }
  
  // Ensure accounts has valid structure
  if (!accounts || typeof accounts !== 'object') {
    accounts = { assets: [], liabilities: [], equity: [], revenue: [], expenses: [] };
  }
  
  // Ensure arrays exist
  const assets = Array.isArray(accounts.assets) ? accounts.assets : [];
  const liabilities = Array.isArray(accounts.liabilities) ? accounts.liabilities : [];
  const equity = Array.isArray(accounts.equity) ? accounts.equity : [];
  const revenue = Array.isArray(accounts.revenue) ? accounts.revenue : [];
  const expenses = Array.isArray(accounts.expenses) ? accounts.expenses : [];
  
  const allAccounts = [
    ...assets,
    ...liabilities,
    ...equity,
    ...revenue,
    ...expenses
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
  if (Array.isArray(transactions)) {
    transactions.forEach(trans => {
      if (trans && trans.entries && Array.isArray(trans.entries)) {
        trans.entries.forEach(entry => {
          if (entry && entry.account) {
            if (!balances[entry.account]) {
              balances[entry.account] = {
                code: entry.account,
                name: entry.account,
                type: 'unknown',
                isContra: false,
                debit: 0,
                credit: 0,
                balance: 0
              };
            }
            balances[entry.account].debit += entry.debit || 0;
            balances[entry.account].credit += entry.credit || 0;
          }
        });
      }
    });
  }
  
  // Process adjusting entries
  if (Array.isArray(adjustments)) {
    adjustments.forEach(adj => {
      if (adj && adj.entries && Array.isArray(adj.entries)) {
        adj.entries.forEach(entry => {
          if (entry && entry.account) {
            if (!balances[entry.account]) {
              balances[entry.account] = {
                code: entry.account,
                name: entry.account,
                type: 'unknown',
                isContra: false,
                debit: 0,
                credit: 0,
                balance: 0
              };
            }
            balances[entry.account].debit += entry.debit || 0;
            balances[entry.account].credit += entry.credit || 0;
          }
        });
      }
    });
  }
  
  // Calculate balances
  allAccounts.forEach(acc => {
    const bal = balances[acc.code];
    if (bal) {
      if (acc.type === 'asset' || acc.type === 'expense') {
        bal.balance = bal.debit - bal.credit;
      } else if (acc.type === 'liability' || acc.type === 'equity' || acc.type === 'revenue') {
        bal.balance = bal.credit - bal.debit;
      }
    }
  });
  
  return balances;
};

// Calculate all reports
const calculateReports = async () => {
  const balances = await calculateAccountBalances();
  const accounts = await getChartOfAccounts();
  
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
  const revenues = (accounts.revenue || []).map(acc => ({
    account: acc.code,
    name: acc.name,
    amount: balances[acc.code] ? balances[acc.code].balance : 0
  }));
  
  const expenses = (accounts.expenses || []).map(acc => ({
    account: acc.code,
    name: acc.name,
    amount: balances[acc.code] ? balances[acc.code].balance : 0
  }));
  
  const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netIncome = totalRevenue - totalExpenses;
  
  // S6 - Statement of Financial Position
  // Separate contra accounts from regular accounts
  const regularAssets = (accounts.assets || []).filter(acc => !acc.isContra);
  const contraAssets = (accounts.assets || []).filter(acc => acc.isContra);
  const regularLiabilities = (accounts.liabilities || []).filter(acc => !acc.isContra);
  const contraLiabilities = (accounts.liabilities || []).filter(acc => acc.isContra);
  
  // Create mapping of contra accounts to their parent accounts
  // Based on naming convention: contra accounts usually have similar codes to parent
  // Example: 1-230 (Kendaraan) -> 1-240 (Akumulasi Penyusutan Kendaraan)
  const contraToParent = {};
  
  contraAssets.forEach(contra => {
    // Try to find parent account by similar code structure
    // For asset contra accounts, look for account with similar prefix
    const contraCodeParts = contra.code.split('-');
    if (contraCodeParts.length >= 2) {
      const prefix = contraCodeParts[0];
      const suffix = contraCodeParts[1];
      
      // Look for parent account (usually one number below for depreciation)
      // e.g., 1-240 (Akumulasi Penyusutan) should link to 1-230 (Kendaraan)
      regularAssets.forEach(parent => {
        const parentCodeParts = parent.code.split('-');
        if (parentCodeParts[0] === prefix) {
          // Check if codes are related (e.g., 1-230 and 1-240)
          const parentSuffix = parseInt(parentCodeParts[1]);
          const contraSuffix = parseInt(suffix);
          
          // If contra account code is close to parent (within 20), assume they're related
          // Also check if name contains similar keywords
          const nameSimilarity = contra.name.toLowerCase().includes('akumulasi') || 
                                contra.name.toLowerCase().includes('penyusutan');
          
          if (nameSimilarity && Math.abs(contraSuffix - parentSuffix) < 20) {
            if (!contraToParent[contra.code]) {
              contraToParent[contra.code] = parent.code;
            }
          }
        }
      });
    }
  });
  
  contraLiabilities.forEach(contra => {
    // Similar logic for liability contra accounts (less common, but possible)
    const contraCodeParts = contra.code.split('-');
    if (contraCodeParts.length >= 2) {
      const prefix = contraCodeParts[0];
      const contraSuffix = parseInt(contraCodeParts[1]);
      regularLiabilities.forEach(parent => {
        const parentCodeParts = parent.code.split('-');
        if (parentCodeParts[0] === prefix) {
          const parentSuffix = parseInt(parentCodeParts[1]);
          if (Math.abs(contraSuffix - parentSuffix) < 20) {
            if (!contraToParent[contra.code]) {
              contraToParent[contra.code] = parent.code;
            }
          }
        }
      });
    }
  });
  
  // Map assets with contra account information
  const assets = regularAssets.map(acc => {
    const amount = balances[acc.code] ? balances[acc.code].balance : 0;
    const contraInfo = {
      account: acc.code,
      name: acc.name,
      amount: amount,
      isContra: false,
      contraAccounts: []
    };
    
    // Find all contra accounts linked to this parent
    Object.keys(contraToParent).forEach(contraCode => {
      if (contraToParent[contraCode] === acc.code) {
        const contraBalance = balances[contraCode] ? balances[contraCode].balance : 0;
        const contraAccount = accounts.assets.find(a => a.code === contraCode);
        if (contraAccount) {
          contraInfo.contraAccounts.push({
            code: contraCode,
            name: contraAccount.name,
            amount: contraBalance
          });
        }
      }
    });
    
    return contraInfo;
  });
  
  // Add contra assets that are not linked (will be shown separately)
  contraAssets.forEach(contra => {
    if (!contraToParent[contra.code]) {
      assets.push({
        account: contra.code,
        name: contra.name,
        amount: balances[contra.code] ? balances[contra.code].balance : 0,
        isContra: true,
        contraAccounts: []
      });
    }
  });
  
  const liabilities = regularLiabilities.map(acc => ({
    account: acc.code,
    name: acc.name,
    amount: balances[acc.code] ? balances[acc.code].balance : 0,
    isContra: false
  }));
  
  // Add contra liabilities if any
  contraLiabilities.forEach(contra => {
    liabilities.push({
      account: contra.code,
      name: contra.name,
      amount: balances[contra.code] ? balances[contra.code].balance : 0,
      isContra: true
    });
  });
  
  // Handle equity accounts with contra accounts (like Prive)
  const regularEquity = (accounts.equity || []).filter(acc => !acc.isContra);
  const contraEquity = (accounts.equity || []).filter(acc => acc.isContra);
  
  // Link contra equity accounts to their parent (e.g., Prive Amin to Modal Amin)
  contraEquity.forEach(contra => {
    const contraCodeParts = contra.code.split('-');
    if (contraCodeParts.length >= 2) {
      const prefix = contraCodeParts[0];
      const contraSuffix = contraCodeParts[1];
      
      // Try to find parent equity account
      regularEquity.forEach(parent => {
        const parentCodeParts = parent.code.split('-');
        if (parentCodeParts[0] === prefix) {
          const parentSuffix = parseInt(parentCodeParts[1]);
          const contraSuffixNum = parseInt(contraSuffix);
          
          // Prive accounts usually follow pattern: 3-101 (Modal) -> 3-301 (Prive)
          // Check if names are related
          const nameSimilarity = contra.name.toLowerCase().includes('prive') && 
                                (parent.name.toLowerCase().includes(contra.name.toLowerCase().replace('prive', '').trim()) ||
                                 parentCodeParts[1] === contraCodeParts[1]?.substring(0, 3));
          
          if ((nameSimilarity || Math.abs(contraSuffixNum - parentSuffix) < 100) && !contraToParent[contra.code]) {
            contraToParent[contra.code] = parent.code;
          }
        }
      });
    }
  });
  
  const equityItems = regularEquity.map(acc => {
    const amount = balances[acc.code] ? balances[acc.code].balance : 0;
    const contraInfo = {
      account: acc.code,
      name: acc.name,
      amount: amount,
      isContra: false,
      contraAccounts: []
    };
    
    // Find contra equity accounts linked to this parent
    Object.keys(contraToParent).forEach(contraCode => {
      if (contraToParent[contraCode] === acc.code) {
        const contraBalance = balances[contraCode] ? balances[contraCode].balance : 0;
        const contraAccount = accounts.equity.find(a => a.code === contraCode);
        if (contraAccount) {
          contraInfo.contraAccounts.push({
            code: contraCode,
            name: contraAccount.name,
            amount: contraBalance
          });
        }
      }
    });
    
    return contraInfo;
  });
  
  // Add unlinked contra equity accounts
  contraEquity.forEach(contra => {
    if (!contraToParent[contra.code]) {
      equityItems.push({
        account: contra.code,
        name: contra.name,
        amount: balances[contra.code] ? balances[contra.code].balance : 0,
        isContra: true,
        contraAccounts: []
      });
    }
  });
  
  // Calculate totals for financial position
  // For assets: regular assets minus contra assets
  const totalRegularAssets = assets
    .filter(a => !a.isContra)
    .reduce((sum, a) => {
      const baseAmount = a.amount || 0;
      const contraAmount = (a.contraAccounts || []).reduce((cSum, c) => cSum + (c.amount || 0), 0);
      return sum + baseAmount - contraAmount;
    }, 0);
  
  const totalContraAssets = assets
    .filter(a => a.isContra && !contraToParent[a.account])
    .reduce((sum, a) => sum + (a.amount || 0), 0);
  
  const totalAssets = totalRegularAssets - totalContraAssets;
  const totalLiabilities = liabilities
    .filter(l => !l.isContra)
    .reduce((sum, l) => sum + (l.amount || 0), 0);
  
  // Get all equity accounts that are capital accounts (excluding retained earnings like 3-200)
  // Subtract contra accounts from capital accounts
  const capitalAccounts = equityItems.filter(e => e.account !== '3-200' && !e.isContra);
  const totalInitialCapitalFromEquity = capitalAccounts.reduce((sum, e) => {
    const baseAmount = e.amount || 0;
    const contraAmount = (e.contraAccounts || []).reduce((cSum, c) => cSum + (c.amount || 0), 0);
    return sum + baseAmount - contraAmount;
  }, 0);
  
  const retainedEarnings = equityItems.find(e => e.account === '3-200')?.amount || 0;
  const totalEquity = totalInitialCapitalFromEquity + retainedEarnings + netIncome;

  // S7 - Statement of Changes in Equity
  // Get all capital accounts dynamically from journal entries (transactions and adjusting entries)
  const transactions = await getTransactions();
  const adjustments = await getAdjustingEntries();
  
  // Create allAccounts array for looking up account names
  const allAccounts = [
    ...(accounts.assets || []),
    ...(accounts.liabilities || []),
    ...(accounts.equity || []),
    ...(accounts.revenue || []),
    ...(accounts.expenses || [])
  ];
  
  // Track all equity accounts that appear in transactions (excluding retained earnings)
  const equityAccountData = {};
  
  // Process transactions to find all equity accounts used
  if (Array.isArray(transactions)) {
    transactions.forEach(trans => {
      if (Array.isArray(trans.entries)) {
        trans.entries.forEach(entry => {
          // Only track equity accounts (starting with '3-') but not retained earnings (3-200)
          if (entry.account && entry.account.startsWith('3-') && entry.account !== '3-200') {
            if (!equityAccountData[entry.account]) {
              equityAccountData[entry.account] = {
                code: entry.account,
                name: '', // Will be filled from chart of accounts
                debits: 0,
                credits: 0,
                balance: 0
              };
            }
            equityAccountData[entry.account].debits += entry.debit || 0;
            equityAccountData[entry.account].credits += entry.credit || 0;
          }
        });
      }
    });
  }
  
  // Process adjusting entries
  if (Array.isArray(adjustments)) {
    adjustments.forEach(adj => {
      if (Array.isArray(adj.entries)) {
        adj.entries.forEach(entry => {
          if (entry.account && entry.account.startsWith('3-') && entry.account !== '3-200') {
            if (!equityAccountData[entry.account]) {
              equityAccountData[entry.account] = {
                code: entry.account,
                name: '',
                debits: 0,
                credits: 0,
                balance: 0
              };
            }
            equityAccountData[entry.account].debits += entry.debit || 0;
            equityAccountData[entry.account].credits += entry.credit || 0;
          }
        });
      }
    });
  }
  
  // Fill in account names from chart of accounts and calculate initial capital
  const equityChanges = [];
  let totalInitialCapital = 0;
  
  // Sort by account code for consistent ordering
  const sortedEquityAccounts = Object.keys(equityAccountData).sort();
  
  for (const accountCode of sortedEquityAccounts) {
    const accountData = equityAccountData[accountCode];
    const accountBalance = balances[accountCode] ? balances[accountCode].balance : 0;
    
    // Get account name from chart of accounts
    const accountInfo = allAccounts.find(acc => acc.code === accountCode);
    const accountName = accountInfo ? accountInfo.name : accountCode;
    
    // Calculate initial capital
    // Formula: Initial Capital = Current Balance - (Credits - Debits)
    // For equity: Credits increase balance, Debits decrease balance
    // So to reverse: Initial = Current - Credits + Debits
    
    let initialCapital;
    if (accountData.debits === 0 && accountData.credits > 0 && accountBalance === accountData.credits) {
      // All balance came from credits, treat credits as initial capital
      initialCapital = accountData.credits;
    } else {
      // Standard calculation: reverse transactions to get initial
      initialCapital = accountBalance - accountData.credits + accountData.debits;
    }
    
    // Ensure initial capital is not negative (minimum 0)
    initialCapital = Math.max(0, initialCapital);
    
    if (initialCapital > 0 || accountData.debits > 0 || accountData.credits > 0) {
      equityChanges.push({
        description: accountName,
        amount: initialCapital
      });
      totalInitialCapital += initialCapital;
    }
  }
  
  // Add total initial capital (always add, even if 0)
  equityChanges.push({
    description: 'Total Modal Awal',
    amount: totalInitialCapital
  });
  
  // Add net income and total equity
  equityChanges.push({
    description: 'Laba Bersih',
    amount: netIncome
  });
  
  equityChanges.push({
    description: 'Total Ekuitas (31 Januari 2024)',
    amount: totalEquity
  });
  
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

const getMetadata = async () => {
  const database = db();
  
  try {
    const metadataPromise = database.prepare('SELECT * FROM metadata').all();
    const metadata = isAsyncDb() ? await metadataPromise : metadataPromise;
    const result = { ...defaultMetadata };
    
    if (metadata && Array.isArray(metadata) && metadata.length > 0) {
      metadata.forEach(row => {
        try {
          result[row.key] = JSON.parse(row.value);
        } catch {
          result[row.key] = row.value;
        }
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error getting metadata:', error);
    return { ...defaultMetadata };
  }
};

const updateMetadata = async (metadata) => {
  const database = db();
  const currentMetadata = await getMetadata();
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
    const existsPromise = check.get(key);
    const exists = isAsyncDb() ? await existsPromise : existsPromise;
    const valueStr = typeof value === 'object' ? JSON.stringify(value) : value;
    
    if (exists) {
      const updatePromise = update.run(valueStr, key);
      await runQuery(() => updatePromise);
    } else {
      const insertPromise = insert.run(key, valueStr);
      await runQuery(() => insertPromise);
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
  deleteAccount,
  createClosingEntries
};
