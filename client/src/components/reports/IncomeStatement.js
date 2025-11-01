import React from 'react';
import '../../App.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const IncomeStatement = ({ reports }) => {
  if (!reports || !reports.incomeStatement) {
    return <div>Memuat data...</div>;
  }

  const { revenues, expenses, totalRevenue, totalExpenses, netIncome } = reports.incomeStatement;

  return (
    <div>
      <h2 className="report-title">S5 - LAPORAN LABA RUGI</h2>
      <p className="report-subtitle">CV ABC</p>
      <p className="report-subtitle">Periode: 31 Januari 2024</p>
      
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
    </div>
  );
};

export default IncomeStatement;

