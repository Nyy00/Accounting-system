import React from 'react';
import '../../App.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const GeneralJournal = ({ transactions }) => {
  return (
    <div>
      <h2 className="report-title">S1 - JURNAL UMUM</h2>
      <p className="report-subtitle">Periode: Januari 2024</p>
      
      <div className="table-container">
        <table className="accounting-table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>Tanggal</th>
              <th style={{ width: '250px' }}>Keterangan</th>
              <th style={{ width: '120px' }}>Akun</th>
              <th style={{ width: '250px' }}>Nama Akun</th>
              <th style={{ width: '150px' }}>Debit (Rp)</th>
              <th style={{ width: '150px' }}>Kredit (Rp)</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, idx) => (
              <React.Fragment key={idx}>
                <tr>
                  <td rowSpan={transaction.entries.length} className="text-center">
                    {new Date(transaction.date).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </td>
                  <td rowSpan={transaction.entries.length}>
                    {transaction.description}
                  </td>
                  <td className="text-center">{transaction.entries[0].account}</td>
                  <td>{getAccountName(transaction.entries[0].account)}</td>
                  <td className="number">{transaction.entries[0].debit > 0 ? formatCurrency(transaction.entries[0].debit) : ''}</td>
                  <td className="number">{transaction.entries[0].credit > 0 ? formatCurrency(transaction.entries[0].credit) : ''}</td>
                </tr>
                {transaction.entries.slice(1).map((entry, entryIdx) => (
                  <tr key={entryIdx}>
                    <td className="text-center">{entry.account}</td>
                    <td>{getAccountName(entry.account)}</td>
                    <td className="number">{entry.debit > 0 ? formatCurrency(entry.debit) : ''}</td>
                    <td className="number">{entry.credit > 0 ? formatCurrency(entry.credit) : ''}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const getAccountName = (code) => {
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

export default GeneralJournal;

