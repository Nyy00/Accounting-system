import React from 'react';
import '../../App.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const TrialBalance = ({ reports, onNextStage, metadata }) => {
  if (!reports || !reports.trialBalance) {
    return <div>Memuat data...</div>;
  }

  const totalDebit = reports.trialBalance.reduce((sum, acc) => sum + acc.debit, 0);
  const totalCredit = reports.trialBalance.reduce((sum, acc) => sum + acc.credit, 0);

  return (
    <div>
      <h2 className="report-title">S3 - NERACA SALDO</h2>
      <p className="report-subtitle">Periode: {metadata?.period || 'Januari 2024'}</p>
      {metadata?.createdBy && (
        <p style={{ textAlign: 'right', marginTop: '10px', fontStyle: 'italic', color: '#666' }}>
          Dibuat oleh: {metadata.createdBy}
        </p>
      )}
      
      <div className="table-container">
        <table className="accounting-table">
          <thead>
            <tr>
              <th style={{ width: '120px' }}>No. Akun</th>
              <th style={{ width: '350px' }}>Nama Akun</th>
              <th style={{ width: '180px' }}>Debit (Rp)</th>
              <th style={{ width: '180px' }}>Kredit (Rp)</th>
            </tr>
          </thead>
          <tbody>
            {reports.trialBalance.map((account, idx) => (
              <tr key={idx}>
                <td className="text-center">{account.account}</td>
                <td>{account.name}</td>
                <td className="number">{account.debit > 0 ? formatCurrency(account.debit) : ''}</td>
                <td className="number">{account.credit > 0 ? formatCurrency(account.credit) : ''}</td>
              </tr>
            ))}
            <tr className="total-row">
              <td colSpan="2" style={{ textAlign: 'right', fontWeight: 'bold' }}>TOTAL:</td>
              <td className="number">{formatCurrency(totalDebit)}</td>
              <td className="number">{formatCurrency(totalCredit)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e8f4f8', borderRadius: '6px' }}>
        <strong>Rumus:</strong> Total Debit = Total Kredit = {formatCurrency(totalDebit)}
      </div>
      
      <div className="action-buttons" style={{ marginTop: '20px' }}>
        {onNextStage && (
          <button 
            onClick={onNextStage} 
            className="btn-success"
            style={{ backgroundColor: '#28a745', color: 'white' }}
          >
            ➜ Proses ke Tahap Selanjutnya (S4 - Neraca Saldo Setelah Penyesuaian)
          </button>
        )}
      </div>
    </div>
  );
};

export default TrialBalance;

