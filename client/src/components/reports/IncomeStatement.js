import React from 'react';
import '../../App.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const IncomeStatement = ({ reports, onNextStage, metadata }) => {
  if (!reports || !reports.incomeStatement) {
    return <div>Memuat data...</div>;
  }

  const { revenues, expenses, totalRevenue, totalExpenses, netIncome } = reports.incomeStatement;

  return (
    <div>
      <h2 className="report-title">S5 - LAPORAN LABA RUGI</h2>
      <p className="report-subtitle">{metadata?.companyName || 'CV ABC'}</p>
      <p className="report-subtitle">Periode: {metadata?.period || '31 Januari 2024'}</p>
      {metadata?.createdBy && (
        <p style={{ textAlign: 'right', marginTop: '10px', fontStyle: 'italic', color: '#666' }}>
          Dibuat oleh: {metadata.createdBy}
        </p>
      )}
      
      <div className="table-container">
        <table className="accounting-table">
          <thead>
            <tr>
              <th style={{ width: '500px' }}>Keterangan</th>
              <th style={{ width: '200px' }}>Jumlah (Rp)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="2" style={{ fontWeight: 'bold', backgroundColor: '#e8f4f8' }}>
                PENDAPATAN
              </td>
            </tr>
            {revenues.map((rev, idx) => (
              <tr key={idx}>
                <td style={{ paddingLeft: '30px' }}>{rev.name}</td>
                <td className="number">{formatCurrency(rev.amount)}</td>
              </tr>
            ))}
            <tr className="total-row">
              <td style={{ fontWeight: 'bold' }}>Total Pendapatan</td>
              <td className="number">{formatCurrency(totalRevenue)}</td>
            </tr>
            
            <tr>
              <td colSpan="2" style={{ fontWeight: 'bold', backgroundColor: '#e8f4f8', paddingTop: '15px' }}>
                BEBAN
              </td>
            </tr>
            {expenses.filter(exp => exp.amount > 0).map((exp, idx) => (
              <tr key={idx}>
                <td style={{ paddingLeft: '30px' }}>{exp.name}</td>
                <td className="number">{formatCurrency(exp.amount)}</td>
              </tr>
            ))}
            <tr className="total-row">
              <td style={{ fontWeight: 'bold' }}>Total Beban</td>
              <td className="number">{formatCurrency(totalExpenses)}</td>
            </tr>
            
            <tr>
              <td colSpan="2" style={{ height: '10px' }}></td>
            </tr>
            
            <tr className="total-row" style={{ backgroundColor: '#c8e6c9' }}>
              <td style={{ fontWeight: 'bold', fontSize: '16px' }}>
                {netIncome >= 0 ? 'LABA BERSIH' : 'RUGI BERSIH'}
              </td>
              <td className="number" style={{ fontWeight: 'bold', fontSize: '16px' }}>
                {formatCurrency(Math.abs(netIncome))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e8f4f8', borderRadius: '6px' }}>
        <strong>Rumus:</strong>
        <br />
        Laba/Rugi Bersih = Total Pendapatan - Total Beban
        <br />
        Laba/Rugi Bersih = {formatCurrency(totalRevenue)} - {formatCurrency(totalExpenses)} = {formatCurrency(netIncome)}
      </div>
      
      {onNextStage && (
        <div style={{ marginTop: '20px', textAlign: 'left' }}>
          <button 
            onClick={onNextStage} 
            className="btn-success"
            style={{ backgroundColor: '#2196F3', color: 'white', padding: '12px 24px', fontSize: '16px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
          >
            ➜ Proses ke Tahap Selanjutnya (S6 - Laporan Posisi Keuangan)
          </button>
        </div>
      )}
    </div>
  );
};

export default IncomeStatement;

