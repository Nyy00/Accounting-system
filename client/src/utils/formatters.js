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
// Account type and info cache
let accountInfoCache = {};

// Initialize account name cache from COA
export const initializeAccountCache = (chartOfAccounts) => {
  accountNameCache = {};
  accountInfoCache = {};
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
      accountInfoCache[acc.code] = {
        type: acc.type,
        isContra: acc.isContra || false,
        name: acc.name
      };
    });
  }
};

// Update cache when account is added/updated
export const updateAccountCache = (code, name, type, isContra) => {
  accountNameCache[code] = name;
  if (accountInfoCache[code]) {
    accountInfoCache[code].name = name;
    if (type) accountInfoCache[code].type = type;
    if (isContra !== undefined) accountInfoCache[code].isContra = isContra;
  } else {
    accountInfoCache[code] = {
      type: type || 'unknown',
      isContra: isContra || false,
      name: name || code
    };
  }
};

// Remove from cache when account is deleted
export const removeAccountCache = (code) => {
  delete accountNameCache[code];
  delete accountInfoCache[code];
};

export const getAccountName = (code) => {
  return accountNameCache[code] || code;
};

export const getAccountType = (code) => {
  return accountInfoCache[code]?.type || 'unknown';
};

export const getAccountInfo = (code) => {
  return accountInfoCache[code] || { type: 'unknown', isContra: false, name: code };
};

