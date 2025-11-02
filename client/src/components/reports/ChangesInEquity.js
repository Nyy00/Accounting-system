import React from 'react';
import '../../App.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const ChangesInEquity = ({ reports, metadata }) => {
  if (!reports || !reports.changesInEquity) {
    return <div>Memuat data...</div>;
  }

  const equityChanges = reports.changesInEquity;

  return (
    <div>
      <h2 className="report-title">S7 - LAPORAN PERUBAHAN EKUITAS</h2>
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
              <td style={{ fontWeight: 'bold' }}>Ekuitas Awal (1 Januari 2024)</td>
              <td></td>
            </tr>
            {equityChanges.filter((item, idx) => idx < equityChanges.length - 2).map((item, idx) => (
              <tr key={idx}>
                <td style={{ paddingLeft: item.description.includes('Total') ? '30px' : '30px' }}>
                  {item.description}
                </td>
                <td className="number">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
            
            <tr className="total-row">
              <td style={{ fontWeight: 'bold' }}>Total Ekuitas Awal</td>
              <td className="number">
                {formatCurrency(equityChanges.find(item => item.description === 'Total Modal Awal')?.amount || 
                  equityChanges.filter((item, idx) => idx < equityChanges.length - 2 && !item.description.includes('Total'))
                    .reduce((sum, item) => sum + item.amount, 0))}
              </td>
            </tr>
            
            <tr>
              <td colSpan="2" style={{ height: '10px' }}></td>
            </tr>
            
            <tr>
              <td style={{ fontWeight: 'bold' }}>Laba/Rugi Bersih</td>
              <td></td>
            </tr>
            <tr>
              <td style={{ paddingLeft: '30px' }}>{equityChanges[equityChanges.length - 2].description}</td>
              <td className="number">{formatCurrency(equityChanges[equityChanges.length - 2].amount)}</td>
            </tr>
            
            <tr>
              <td colSpan="2" style={{ height: '10px' }}></td>
            </tr>
            
            <tr className="total-row" style={{ backgroundColor: '#c8e6c9' }}>
              <td style={{ fontWeight: 'bold', fontSize: '16px' }}>
                {equityChanges[equityChanges.length - 1].description}
              </td>
              <td className="number" style={{ fontWeight: 'bold', fontSize: '16px' }}>
                {formatCurrency(equityChanges[equityChanges.length - 1].amount)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e8f4f8', borderRadius: '6px' }}>
        <strong>Rumus:</strong>
        <br />
        Ekuitas Akhir = Ekuitas Awal + Laba/Rugi Bersih
        <br />
        {formatCurrency(equityChanges[equityChanges.length - 1].amount)} = {' '}
        {formatCurrency(equityChanges.find(item => item.description === 'Total Modal Awal')?.amount || 0)} + {' '}
        {formatCurrency(equityChanges[equityChanges.length - 2].amount)}
      </div>
    </div>
  );
};

export default ChangesInEquity;

