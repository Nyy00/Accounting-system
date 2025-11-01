import React from 'react';
import '../../App.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const AdjustedTrialBalance = ({ reports, adjustingEntries }) => {
  if (!reports || !reports.adjustedTrialBalance) {
    return <div>Memuat data...</div>;
  }

  const totalDebit = reports.adjustedTrialBalance.reduce((sum, acc) => sum + acc.debit, 0);
  const totalCredit = reports.adjustedTrialBalance.reduce((sum, acc) => sum + acc.credit, 0);

  return (
    <div>
      <h2 className="report-title">S4 - NERACA SALDO SETELAH PENYESUAIAN</h2>
      <p className="report-subtitle">Periode: Januari 2024</p>
      
      {adjustingEntries && adjustingEntries.length > 0 && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fff9e6', borderRadius: '6px', border: '1px solid #ffd700' }}>
          <h3 style={{ marginBottom: '10px', color: '#b8860b' }}>Jurnal Penyesuaian:</h3>
          <ul style={{ marginLeft: '20px' }}>
            {adjustingEntries.map((adj, idx) => (
              <li key={idx} style={{ marginBottom: '5px' }}>
                {adj.description} - {formatCurrency(adj.entries[0].debit || adj.entries[0].credit)}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="table-container">
        <table className="accounting-table">
          <thead>
            <tr>
              <th style={{ width: '120px' }}>No. Akun</th>
              <th style={{ width: '350px' }}>Nama Akun</th>
              <th style={{ width: '150px' }}>Debit (Rp)</th>
              <th style={{ width: '150px' }}>Kredit (Rp)</th>
              <th style={{ width: '150px' }}>Saldo (Rp)</th>
            </tr>
          </thead>
          <tbody>
            {reports.adjustedTrialBalance.map((account, idx) => (
              <tr key={idx}>
                <td className="text-center">{account.account}</td>
                <td>{account.name}</td>
                <td className="number">{account.debit > 0 ? formatCurrency(account.debit) : ''}</td>
                <td className="number">{account.credit > 0 ? formatCurrency(account.credit) : ''}</td>
                <td className="number">{formatCurrency(account.balance)}</td>
              </tr>
            ))}
            <tr className="total-row">
              <td colSpan="2" style={{ textAlign: 'right', fontWeight: 'bold' }}>TOTAL:</td>
              <td className="number">{formatCurrency(totalDebit)}</td>
              <td className="number">{formatCurrency(totalCredit)}</td>
              <td className="number"></td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e8f4f8', borderRadius: '6px' }}>
        <strong>Rumus:</strong> Total Debit = Total Kredit = {formatCurrency(totalDebit)}
        <br />
        <strong>Catatan:</strong> Seluruh saldo setelah penyesuaian akan digunakan untuk membuat Laporan Laba Rugi dan Laporan Posisi Keuangan.
      </div>
    </div>
  );
};

export default AdjustedTrialBalance;

