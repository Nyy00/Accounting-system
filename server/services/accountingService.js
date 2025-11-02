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
  const defaultTransactions = [
    {
      id: 1,
      date: '2024-01-01',
      description: 'Setoran modal awal oleh Bapak Amin dan Fawzi',
      entries: [
        { account: '1-110', debit: 100000000, credit: 0 },
        { account: '3-101', debit: 0, credit: 60000000 },
        { account: '3-102', debit: 0, credit: 40000000 }
      ]
    },
    {
      id: 2,
      date: '2024-01-01',
      description: 'Membayar sewa kantor untuk 1 tahun',
      entries: [
        { account: '1-150', debit: 24000000, credit: 0 },
        { account: '1-110', debit: 0, credit: 24000000 }
      ]
    },
    {
      id: 3,
      date: '2024-01-01',
      description: 'Membeli mobil senilai Rp200 juta',
      entries: [
        { account: '1-230', debit: 200000000, credit: 0 },
        { account: '1-110', debit: 0, credit: 40000000 },
        { account: '2-210', debit: 0, credit: 160000000 }
      ]
    },
    {
      id: 4,
      date: '2024-01-02',
      description: 'Membeli perlengkapan kantor',
      entries: [
        { account: '1-140', debit: 10000000, credit: 0 },
        { account: '1-110', debit: 0, credit: 10000000 }
      ]
    },
    {
      id: 5,
      date: '2024-01-02',
      description: 'Mengambil uang untuk kas kecil',
      entries: [
        { account: '1-100', debit: 1000000, credit: 0 },
        { account: '1-110', debit: 0, credit: 1000000 }
      ]
    },
    {
      id: 6,
      date: '2024-01-04',
      description: 'Menerima pembayaran awal jasa konsultasi dari PT HIJ',
      entries: [
        { account: '1-110', debit: 10000000, credit: 0 },
        { account: '4-100', debit: 0, credit: 10000000 }
      ]
    },
    {
      id: 7,
      date: '2024-01-31',
      description: 'Menerima pembayaran akhir jasa konsultasi dari PT HIJ',
      entries: [
        { account: '1-110', debit: 20000000, credit: 0 },
        { account: '4-100', debit: 0, credit: 20000000 }
      ]
    }
  ];

  const defaultAdjustingEntries = [
    {
      id: 1,
      date: '2024-01-31',
      description: 'Gaji pegawai belum dicatat',
      entries: [
        { account: '5-100', debit: 10000000, credit: 0 },
        { account: '2-110', debit: 0, credit: 10000000 }
      ]
    },
    {
      id: 2,
      date: '2024-01-31',
      description: 'Tagihan listrik, air dan internet belum dicatat',
      entries: [
        { account: '5-120', debit: 5000000, credit: 0 },
        { account: '2-120', debit: 0, credit: 5000000 }
      ]
    },
    {
      id: 3,
      date: '2024-01-31',
      description: 'Beban depresiasi kendaraan',
      entries: [
        { account: '5-130', debit: 1600000, credit: 0 },
        { account: '1-240', debit: 0, credit: 1600000 }
      ]
    },
    {
      id: 4,
      date: '2024-01-31',
      description: 'Pemakaian perlengkapan kantor (10jt - 8jt = 2jt)',
      entries: [
        { account: '5-120', debit: 2000000, credit: 0 },
        { account: '1-140', debit: 0, credit: 2000000 }
      ]
    },
    {
      id: 5,
      date: '2024-01-31',
      description: 'Beban sewa kantor untuk bulan Januari (24jt / 12)',
      entries: [
        { account: '5-110', debit: 2000000, credit: 0 },
        { account: '1-150', debit: 0, credit: 2000000 }
      ]
    }
  ];

  const loadedTransactions = readJsonFile(TRANSACTIONS_FILE, defaultTransactions);
  const loadedAdjustingEntries = readJsonFile(ADJUSTING_ENTRIES_FILE, defaultAdjustingEntries);
  const state = readJsonFile(STATE_FILE, { nextTransactionId: 8, nextAdjustingEntryId: 6 });

  // Initialize files if they don't exist
  if (!fs.existsSync(TRANSACTIONS_FILE)) {
    writeJsonFile(TRANSACTIONS_FILE, loadedTransactions);
  }
  if (!fs.existsSync(ADJUSTING_ENTRIES_FILE)) {
    writeJsonFile(ADJUSTING_ENTRIES_FILE, loadedAdjustingEntries);
  }
  if (!fs.existsSync(STATE_FILE)) {
    writeJsonFile(STATE_FILE, state);
  }

  return {
    transactions: loadedTransactions,
    adjustingEntries: loadedAdjustingEntries,
    nextTransactionId: state.nextTransactionId || 8,
    nextAdjustingEntryId: state.nextAdjustingEntryId || 6
  };
};

// Chart of Accounts
const getChartOfAccounts = () => {
  return {
    assets: [
      { code: '1-100', name: 'Kas kecil', type: 'asset' },
      { code: '1-110', name: 'Bank', type: 'asset' },
      { code: '1-140', name: 'Perlengkapan Kantor', type: 'asset' },
      { code: '1-150', name: 'Sewa dibayar dimuka', type: 'asset' },
      { code: '1-230', name: 'Kendaraan', type: 'asset' },
      { code: '1-240', name: 'Akumulasi Penyusutan Kendaraan', type: 'asset', isContra: true }
    ],
    liabilities: [
      { code: '2-110', name: 'Utang Gaji', type: 'liability' },
      { code: '2-120', name: 'Utang lain-lain', type: 'liability' },
      { code: '2-130', name: 'Pendapatan Diterima di Muka', type: 'liability' },
      { code: '2-210', name: 'Utang Bank', type: 'liability' }
    ],
    equity: [
      { code: '3-101', name: 'Modal Amin', type: 'equity' },
      { code: '3-102', name: 'Modal Fawzi', type: 'equity' },
      { code: '3-200', name: 'Laba ditahan', type: 'equity' }
    ],
    revenue: [
      { code: '4-100', name: 'Pendapatan', type: 'revenue' }
    ],
    expenses: [
      { code: '5-100', name: 'Beban Gaji', type: 'expense' },
      { code: '5-110', name: 'Beban Sewa Kantor', type: 'expense' },
      { code: '5-120', name: 'Beban Listrik, Air, Internet dan lain-lain', type: 'expense' },
      { code: '5-130', name: 'Beban penyusutan kendaraan', type: 'expense' }
    ]
  };
};

// Load data from files
const dataStore = loadData();
let transactions = dataStore.transactions;
let nextTransactionId = dataStore.nextTransactionId;

// CRUD Operations for Transactions
const addTransaction = (transaction) => {
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
  const index = transactions.findIndex(t => t.id === id);
  if (index === -1) {
    throw new Error('Transaction not found');
  }
  
  transactions.splice(index, 1);
  
  // Save to file
  writeJsonFile(TRANSACTIONS_FILE, transactions);
  
  return true;
};

// January 2024 Transactions (S1 - Jurnal Umum)
const getTransactions = () => {
  return transactions;
};

// Adjusting Entries (S4 - Jurnal Penyesuaian)
let adjustingEntries = dataStore.adjustingEntries;
let nextAdjustingEntryId = dataStore.nextAdjustingEntryId;

// CRUD Operations for Adjusting Entries
const addAdjustingEntry = (entry) => {
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
  const index = adjustingEntries.findIndex(e => e.id === id);
  if (index === -1) {
    throw new Error('Adjusting entry not found');
  }
  
  adjustingEntries.splice(index, 1);
  
  // Save to file
  writeJsonFile(ADJUSTING_ENTRIES_FILE, adjustingEntries);
  
  return true;
};

const getAdjustingEntries = () => {
  return adjustingEntries;
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
  updateMetadata
};

