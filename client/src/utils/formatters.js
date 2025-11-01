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

export const getAccountName = (code) => {
  const accounts = {
    '1-100': 'Kas kecil',
    '1-110': 'Bank',
    '1-140': 'Perlengkapan Kantor',
    '1-150': 'Sewa dibayar dimuka',
    '1-230': 'Kendaraan',
    '1-240': 'Akumulasi Penyusutan Kendaraan',
    '2-110': 'Utang Gaji',
    '2-120': 'Utang lain-lain',
    '2-130': 'Pendapatan Diterima di Muka',
    '2-210': 'Utang Bank',
    '3-101': 'Modal Amin',
    '3-102': 'Modal Fawzi',
    '3-200': 'Laba ditahan',
    '4-100': 'Pendapatan',
    '5-100': 'Beban Gaji',
    '5-110': 'Beban Sewa Kantor',
    '5-120': 'Beban Listrik, Air, Internet dan lain-lain',
    '5-130': 'Beban penyusutan kendaraan'
  };
  return accounts[code] || code;
};

