// Utility functions for formatting

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Account name cache
let accountNameCache = {};

// Initialize account name cache from COA
export const initializeAccountCache = (chartOfAccounts) => {
  accountNameCache = {};
  if (chartOfAccounts) {
    const allAccounts = [
      ...(chartOfAccounts.assets || []),
      ...(chartOfAccounts.liabilities || []),
      ...(chartOfAccounts.equity || []),
      ...(chartOfAccounts.revenue || []),
      ...(chartOfAccounts.expenses || [])
    ];
    allAccounts.forEach(acc => {
      accountNameCache[acc.code] = acc.name;
    });
  }
};

// Update cache when account is added/updated
export const updateAccountCache = (code, name) => {
  accountNameCache[code] = name;
};

// Remove from cache when account is deleted
export const removeAccountCache = (code) => {
  delete accountNameCache[code];
};

export const getAccountName = (code) => {
  return accountNameCache[code] || code;
};

