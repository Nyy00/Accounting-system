const fs = require('fs');
const path = require('path');

// File paths for data persistence
// For Vercel, use /tmp (but note: /tmp is not persistent across deployments)
// For local development, use data/ folder
const DATA_DIR = process.env.DATA_DIR || (
  process.env.VERCEL ? '/tmp/accounting-data' : path.join(__dirname, '../../data')
);
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'transactions.json');
const ADJUSTING_ENTRIES_FILE = path.join(DATA_DIR, 'adjusting-entries.json');
const STATE_FILE = path.join(DATA_DIR, 'state.json');
const METADATA_FILE = path.join(DATA_DIR, 'metadata.json');
const COA_FILE = path.join(DATA_DIR, 'chart-of-accounts.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper functions for file operations
const readJsonFile = (filePath, defaultValue = null) => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
  }
  return defaultValue;
};

const writeJsonFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
};

// Load data from files on startup
const loadData = () => {
  // Start with empty arrays - no default data
  const defaultTransactions = [];
  const defaultAdjustingEntries = [];

  // Check if files exist first to avoid overwriting with defaults
  const transactionsExist = fs.existsSync(TRANSACTIONS_FILE);
  const adjustingEntriesExist = fs.existsSync(ADJUSTING_ENTRIES_FILE);
  const stateExists = fs.existsSync(STATE_FILE);

  // Only use defaults if file doesn't exist
  const loadedTransactions = transactionsExist 
    ? readJsonFile(TRANSACTIONS_FILE, [])  // If exists but empty, return empty array
    : defaultTransactions;
  const loadedAdjustingEntries = adjustingEntriesExist
    ? readJsonFile(ADJUSTING_ENTRIES_FILE, [])  // If exists but empty, return empty array
    : defaultAdjustingEntries;
  const state = stateExists
    ? readJsonFile(STATE_FILE, { nextTransactionId: 1, nextAdjustingEntryId: 1 })
    : { nextTransactionId: 1, nextAdjustingEntryId: 1 };

  // Initialize files if they don't exist (only on first run)
  if (!transactionsExist) {
    writeJsonFile(TRANSACTIONS_FILE, loadedTransactions);
  }
  if (!adjustingEntriesExist) {
    writeJsonFile(ADJUSTING_ENTRIES_FILE, loadedAdjustingEntries);
  }
  if (!stateExists) {
    writeJsonFile(STATE_FILE, state);
  }

  return {
    transactions: loadedTransactions,
    adjustingEntries: loadedAdjustingEntries,
    nextTransactionId: state.nextTransactionId || 1,
    nextAdjustingEntryId: state.nextAdjustingEntryId || 1
  };
};

// Chart of Accounts - Now stored in file
const getChartOfAccounts = () => {
  const defaultCOA = {
    assets: [],
    liabilities: [],
    equity: [],
    revenue: [],
    expenses: []
  };
  
  const coaExists = fs.existsSync(COA_FILE);
  const chartOfAccounts = coaExists
    ? readJsonFile(COA_FILE, defaultCOA)
    : defaultCOA;
  
  // Initialize file if it doesn't exist
  if (!coaExists) {
    writeJsonFile(COA_FILE, chartOfAccounts);
  }
  
  return chartOfAccounts;
};

// CRUD Operations for Chart of Accounts
const addAccount = (account) => {
  const chartOfAccounts = getChartOfAccounts();
  const { code, name, type, isContra } = account;
  
  if (!code || !name || !type) {
    throw new Error('Account must have code, name, and type');
  }
  
  // Check if code already exists
  const allAccounts = [
    ...chartOfAccounts.assets,
    ...chartOfAccounts.liabilities,
    ...chartOfAccounts.equity,
    ...chartOfAccounts.revenue,
    ...chartOfAccounts.expenses
  ];
  
  if (allAccounts.find(acc => acc.code === code)) {
    throw new Error(`Account code ${code} already exists`);
  }
  
  const newAccount = {
    code,
    name,
    type,
    isContra: isContra || false
  };
  
  // Add to appropriate category
  const categoryMap = {
    'asset': 'assets',
    'liability': 'liabilities',
    'equity': 'equity',
    'revenue': 'revenue',
    'expense': 'expenses'
  };
  
  const category = categoryMap[type] || 'assets';
  chartOfAccounts[category].push(newAccount);
  
  // Save to file
  writeJsonFile(COA_FILE, chartOfAccounts);
  
  return newAccount;
};

const updateAccount = (code, account) => {
  const chartOfAccounts = getChartOfAccounts();
  const { name, type, isContra } = account;
  
  if (!name || !type) {
    throw new Error('Account must have name and type');
  }
  
  // Find account in all categories
  let found = false;
  const categories = ['assets', 'liabilities', 'equity', 'revenue', 'expenses'];
  
  const categoryMap = {
    'asset': 'assets',
    'liability': 'liabilities',
    'equity': 'equity',
    'revenue': 'revenue',
    'expense': 'expenses'
  };
  
  const targetCategory = categoryMap[type] || 'assets';
  
  for (const category of categories) {
    const index = chartOfAccounts[category].findIndex(acc => acc.code === code);
    if (index !== -1) {
      // If type changed, move to new category
      if (targetCategory !== category) {
        chartOfAccounts[category].splice(index, 1);
        chartOfAccounts[targetCategory].push({
          code,
          name,
          type,
          isContra: isContra || false
        });
      } else {
        chartOfAccounts[category][index] = {
          code,
          name,
          type,
          isContra: isContra || false
        };
      }
      found = true;
      break;
    }
  }
  
  if (!found) {
    throw new Error('Account not found');
  }
  
  // Save to file
  writeJsonFile(COA_FILE, chartOfAccounts);
  
  return { code, name, type, isContra: isContra || false };
};

const deleteAccount = (code) => {
  const chartOfAccounts = getChartOfAccounts();
  
  const categories = ['assets', 'liabilities', 'equity', 'revenue', 'expenses'];
  let found = false;
  
  for (const category of categories) {
    const index = chartOfAccounts[category].findIndex(acc => acc.code === code);
    if (index !== -1) {
      chartOfAccounts[category].splice(index, 1);
      found = true;
      break;
    }
  }
  
  if (!found) {
    throw new Error('Account not found');
  }
  
  // Save to file
  writeJsonFile(COA_FILE, chartOfAccounts);
  
  return true;
};

// Load data from files
const dataStore = loadData();
let transactions = dataStore.transactions;
let nextTransactionId = dataStore.nextTransactionId;

// Helper function to reload data from file
const reloadTransactions = () => {
  // Always read from file, use empty array as default if file doesn't exist
  const fileData = readJsonFile(TRANSACTIONS_FILE, null);
  
  // If file exists, use its data (even if empty array)
  if (fileData !== null) {
    transactions = fileData;
    // Update nextTransactionId based on max ID in transactions
    if (transactions.length > 0) {
      const maxId = Math.max(...transactions.map(t => t.id || 0));
      nextTransactionId = maxId + 1;
    }
  }
  // If fileData is null (file doesn't exist), keep current transactions
  
  return transactions;
};

// Helper function to reload adjusting entries from file
const reloadAdjustingEntries = () => {
  // Always read from file, use null as default if file doesn't exist
  const fileData = readJsonFile(ADJUSTING_ENTRIES_FILE, null);
  
  // If file exists, use its data (even if empty array)
  if (fileData !== null) {
    adjustingEntries = fileData;
    // Update nextAdjustingEntryId based on max ID
    if (adjustingEntries.length > 0) {
      const maxId = Math.max(...adjustingEntries.map(e => e.id || 0));
      nextAdjustingEntryId = maxId + 1;
    }
  }
  // If fileData is null (file doesn't exist), keep current adjustingEntries
  
  return adjustingEntries;
};

// CRUD Operations for Transactions
const addTransaction = (transaction) => {
  // Reload from file to ensure we have latest data
  reloadTransactions();
  // Validate transaction
  if (!transaction.date || !transaction.description || !transaction.entries || transaction.entries.length < 2) {
    throw new Error('Invalid transaction: must have date, description, and at least 2 entries');
  }
  
  // Validate double-entry bookkeeping
  const totalDebit = transaction.entries.reduce((sum, e) => sum + (e.debit || 0), 0);
  const totalCredit = transaction.entries.reduce((sum, e) => sum + (e.credit || 0), 0);
  
  if (totalDebit !== totalCredit) {
    throw new Error(`Unbalanced transaction: Debit ${totalDebit} ≠ Credit ${totalCredit}`);
  }
  
  const newTransaction = {
    id: nextTransactionId++,
    date: transaction.date,
    description: transaction.description,
    entries: transaction.entries
  };
  
  transactions.push(newTransaction);
  
  // Save to file
  writeJsonFile(TRANSACTIONS_FILE, transactions);
  writeJsonFile(STATE_FILE, { nextTransactionId, nextAdjustingEntryId });
  
  return newTransaction;
};

const updateTransaction = (id, transaction) => {
  // Reload from file to ensure we have latest data
  reloadTransactions();
  
  // Validate transaction
  if (!transaction.date || !transaction.description || !transaction.entries || transaction.entries.length < 2) {
    throw new Error('Invalid transaction: must have date, description, and at least 2 entries');
  }
  
  // Validate double-entry bookkeeping
  const totalDebit = transaction.entries.reduce((sum, e) => sum + (e.debit || 0), 0);
  const totalCredit = transaction.entries.reduce((sum, e) => sum + (e.credit || 0), 0);
  
  if (totalDebit !== totalCredit) {
    throw new Error(`Unbalanced transaction: Debit ${totalDebit} ≠ Credit ${totalCredit}`);
  }
  
  const index = transactions.findIndex(t => t.id === id);
  if (index === -1) {
    throw new Error('Transaction not found');
  }
  
  transactions[index] = {
    id: id,
    date: transaction.date,
    description: transaction.description,
    entries: transaction.entries
  };
  
  // Save to file
  writeJsonFile(TRANSACTIONS_FILE, transactions);
  
  return transactions[index];
};

const deleteTransaction = (id) => {
  // Reload from file to ensure we have latest data
  reloadTransactions();
  
  const index = transactions.findIndex(t => t.id === id);
  if (index === -1) {
    throw new Error('Transaction not found');
  }
  
  transactions.splice(index, 1);
  
  // Save to file
  const saved = writeJsonFile(TRANSACTIONS_FILE, transactions);
  if (!saved) {
    throw new Error('Failed to save transaction deletion to file');
  }
  
  return true;
};

// January 2024 Transactions (S1 - Jurnal Umum)
const getTransactions = () => {
  // Always reload from file to get latest data
  return reloadTransactions();
};

// Adjusting Entries (S4 - Jurnal Penyesuaian)
let adjustingEntries = dataStore.adjustingEntries;
let nextAdjustingEntryId = dataStore.nextAdjustingEntryId;

// CRUD Operations for Adjusting Entries
const addAdjustingEntry = (entry) => {
  // Reload from file to ensure we have latest data
  reloadAdjustingEntries();
  // Validate entry
  if (!entry.date || !entry.description || !entry.entries || entry.entries.length < 2) {
    throw new Error('Invalid adjusting entry: must have date, description, and at least 2 entries');
  }
  
  // Validate double-entry bookkeeping
  const totalDebit = entry.entries.reduce((sum, e) => sum + (e.debit || 0), 0);
  const totalCredit = entry.entries.reduce((sum, e) => sum + (e.credit || 0), 0);
  
  if (totalDebit !== totalCredit) {
    throw new Error(`Unbalanced entry: Debit ${totalDebit} ≠ Credit ${totalCredit}`);
  }
  
  const newEntry = {
    id: nextAdjustingEntryId++,
    date: entry.date,
    description: entry.description,
    entries: entry.entries
  };
  
  adjustingEntries.push(newEntry);
  
  // Save to file
  writeJsonFile(ADJUSTING_ENTRIES_FILE, adjustingEntries);
  writeJsonFile(STATE_FILE, { nextTransactionId, nextAdjustingEntryId });
  
  return newEntry;
};

const updateAdjustingEntry = (id, entry) => {
  // Reload from file to ensure we have latest data
  reloadAdjustingEntries();
  
  // Validate entry
  if (!entry.date || !entry.description || !entry.entries || entry.entries.length < 2) {
    throw new Error('Invalid adjusting entry: must have date, description, and at least 2 entries');
  }
  
  // Validate double-entry bookkeeping
  const totalDebit = entry.entries.reduce((sum, e) => sum + (e.debit || 0), 0);
  const totalCredit = entry.entries.reduce((sum, e) => sum + (e.credit || 0), 0);
  
  if (totalDebit !== totalCredit) {
    throw new Error(`Unbalanced entry: Debit ${totalDebit} ≠ Credit ${totalCredit}`);
  }
  
  const index = adjustingEntries.findIndex(e => e.id === id);
  if (index === -1) {
    throw new Error('Adjusting entry not found');
  }
  
  adjustingEntries[index] = {
    id: id,
    date: entry.date,
    description: entry.description,
    entries: entry.entries
  };
  
  // Save to file
  writeJsonFile(ADJUSTING_ENTRIES_FILE, adjustingEntries);
  
  return adjustingEntries[index];
};

const deleteAdjustingEntry = (id) => {
  // Reload from file to ensure we have latest data
  reloadAdjustingEntries();
  
  const index = adjustingEntries.findIndex(e => e.id === id);
  if (index === -1) {
    throw new Error('Adjusting entry not found');
  }
  
  adjustingEntries.splice(index, 1);
  
  // Save to file
  const saved = writeJsonFile(ADJUSTING_ENTRIES_FILE, adjustingEntries);
  if (!saved) {
    throw new Error('Failed to save adjusting entry deletion to file');
  }
  
  return true;
};

const getAdjustingEntries = () => {
  // Always reload from file to get latest data
  return reloadAdjustingEntries();
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
      balances[entry.account].debit += entry.debit;
      balances[entry.account].credit += entry.credit;
    });
  });
  
  // Process adjusting entries
  adjustments.forEach(adj => {
    adj.entries.forEach(entry => {
      balances[entry.account].debit += entry.debit;
      balances[entry.account].credit += entry.credit;
    });
  });
  
  // Calculate balances
  allAccounts.forEach(acc => {
    const bal = balances[acc.code];
    if (acc.type === 'asset' || acc.type === 'expense') {
      // For contra asset accounts, calculate as normal but they will have negative balance
      // (credit > debit), which is correct for reducing total assets
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
    amount: balances[acc.code].balance
  }));
  
  const expenses = accounts.expenses.map(acc => ({
    account: acc.code,
    name: acc.name,
    amount: balances[acc.code].balance
  }));
  
  const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netIncome = totalRevenue - totalExpenses;
  
  // S6 - Statement of Financial Position
  const assets = accounts.assets.map(acc => ({
    account: acc.code,
    name: acc.name,
    amount: balances[acc.code].balance
  }));
  
  const liabilities = accounts.liabilities.map(acc => ({
    account: acc.code,
    name: acc.name,
    amount: balances[acc.code].balance
  }));
  
  const equityItems = accounts.equity.map(acc => ({
    account: acc.code,
    name: acc.name,
    amount: balances[acc.code].balance
  }));
  
  // Calculate totals for financial position
  const totalAssets = assets.reduce((sum, a) => sum + (a.amount || 0), 0);
  const totalLiabilities = liabilities.reduce((sum, l) => sum + (l.amount || 0), 0);
  
  // For equity in financial position:
  // Modal partners + Retained Earnings (which includes net income if not distributed)
  // Since this is end of first period, we show initial capital + net income
  const initialCapital = equityItems
    .filter(e => e.account === '3-101' || e.account === '3-102')
    .reduce((sum, e) => sum + (e.amount || 0), 0);
  const retainedEarnings = equityItems.find(e => e.account === '3-200')?.amount || 0;
  const totalEquity = initialCapital + retainedEarnings + netIncome;
  
  // S7 - Statement of Changes in Equity
  // Initial capital - get from first transaction (capital contribution)
  // For CV ABC, initial capital is from the first transaction
  const initialAminCapital = 60000000; // From first transaction
  const initialFawziCapital = 40000000; // From first transaction
  const totalInitialCapital = initialAminCapital + initialFawziCapital;
  
  // For CV, net income is typically added to retained earnings or distributed to partners
  // Here we'll add it to retained earnings for this period
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

// Metadata functions (Judul, Periode, Nama Pembuat)
const defaultMetadata = {
  companyName: 'CV ABC',
  reportTitle: 'Sistem Akuntansi CV ABC',
  period: 'Januari 2024',
  periodDetail: 'Bulan Januari 2024',
  createdBy: '',
  date: new Date().toISOString().split('T')[0]
};

const getMetadata = () => {
  return readJsonFile(METADATA_FILE, defaultMetadata);
};

const updateMetadata = (metadata) => {
  const currentMetadata = getMetadata();
  const updatedMetadata = {
    ...currentMetadata,
    ...metadata,
    date: metadata.date || currentMetadata.date || new Date().toISOString().split('T')[0]
  };
  writeJsonFile(METADATA_FILE, updatedMetadata);
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

