import React from 'react';
import '../../App.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const FinancialPosition = ({ reports, onNextStage, metadata }) => {
  if (!reports || !reports.financialPosition) {
    return <div>Memuat data...</div>;
  }

  const { assets, liabilities, equity, totalAssets, totalLiabilities, totalEquity, netIncome } = reports.financialPosition;

  return (
    <div>
      <h2 className="report-title">S6 - LAPORAN POSISI KEUANGAN</h2>
      <p className="report-subtitle">{metadata?.companyName || 'CV ABC'}</p>
      <p className="report-subtitle">Per {metadata?.period || '31 Januari 2024'}</p>
      {metadata?.createdBy && (
        <p style={{ textAlign: 'right', marginTop: '10px', fontStyle: 'italic', color: '#666' }}>
          Dibuat oleh: {metadata.createdBy}
        </p>
      )}
      
      <div className="action-buttons">
        {onNextStage && (
          <button 
            onClick={onNextStage} 
            className="btn-success"
            style={{ backgroundColor: '#28a745', color: 'white', marginBottom: '20px' }}
          >
            ➜ Proses ke Tahap Selanjutnya (S7 - Laporan Perubahan Ekuitas)
          </button>
        )}
      </div>
      
      <div className="table-container">
        <table className="accounting-table">
          <thead>
            <tr>
              <th style={{ width: '400px' }}>AKTIVA</th>
              <th style={{ width: '200px' }}>Jumlah (Rp)</th>
              <th style={{ width: '400px' }}>PASIVA</th>
              <th style={{ width: '200px' }}>Jumlah (Rp)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="2" style={{ fontWeight: 'bold', backgroundColor: '#e8f4f8' }}>
                AKTIVA LANCAR
              </td>
              <td colSpan="2" style={{ fontWeight: 'bold', backgroundColor: '#e8f4f8' }}>
                KEWAJIBAN
              </td>
            </tr>
            {assets.filter(a => !a.account.includes('240') && (a.account.startsWith('1-1') || a.account === '1-100' || a.account === '1-110' || a.account === '1-140' || a.account === '1-150')).map((asset, idx) => (
              <tr key={idx}>
                <td style={{ paddingLeft: '30px' }}>{asset.name}</td>
                <td className="number">{formatCurrency(asset.amount)}</td>
                <td></td>
                <td></td>
              </tr>
            ))}
            
            <tr>
              <td colSpan="2" style={{ fontWeight: 'bold', backgroundColor: '#e8f4f8', paddingTop: '15px' }}>
                AKTIVA TETAP
              </td>
              <td></td>
              <td></td>
            </tr>
            {/* Fixed Assets with Contra Accounts */}
            {assets.filter(a => !a.isContra && (a.account.startsWith('1-2') || a.account.startsWith('1-5') || a.account.startsWith('1-6'))).map((asset, idx) => {
              const contraAmount = (asset.contraAccounts || []).reduce((sum, c) => sum + (c.amount || 0), 0);
              const netAmount = (asset.amount || 0) - contraAmount;
              
              return (
                <React.Fragment key={idx}>
                  <tr>
                    <td style={{ paddingLeft: '30px' }}>{asset.name}</td>
                    <td className="number">{formatCurrency(asset.amount)}</td>
                    <td></td>
                    <td></td>
                  </tr>
                  {/* Show contra accounts if any */}
                  {(asset.contraAccounts || []).filter(c => c.amount !== 0).map((contra, cIdx) => (
                    <tr key={`contra-${idx}-${cIdx}`}>
                      <td style={{ paddingLeft: '50px', fontStyle: 'italic' }}>
                        Dikurangi: {contra.name}
                      </td>
                      <td className="number" style={{ color: '#d32f2f' }}>
                        {formatCurrency(contra.amount)}
                      </td>
                      <td></td>
                      <td></td>
                    </tr>
                  ))}
                  {/* Show net amount if there are contra accounts */}
                  {contraAmount !== 0 && (
                    <tr className="total-row">
                      <td style={{ paddingLeft: '30px', fontWeight: 'bold' }}>
                        {asset.name} (Bersih)
                      </td>
                      <td className="number" style={{ fontWeight: 'bold' }}>
                        {formatCurrency(netAmount)}
                      </td>
                      <td></td>
                      <td></td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {liabilities.map((liab, idx) => (
              <tr key={idx}>
                <td></td>
                <td></td>
                <td style={{ paddingLeft: '30px' }}>{liab.name}</td>
                <td className="number">{liab.amount !== 0 ? formatCurrency(liab.amount) : ''}</td>
              </tr>
            ))}
            
            <tr className="total-row">
              <td style={{ fontWeight: 'bold' }}>Total Aktiva</td>
              <td className="number">{formatCurrency(totalAssets)}</td>
              <td style={{ fontWeight: 'bold' }}>Total Kewajiban</td>
              <td className="number">{formatCurrency(totalLiabilities)}</td>
            </tr>
            
            <tr>
              <td colSpan="2" style={{ height: '10px' }}></td>
              <td colSpan="2" style={{ fontWeight: 'bold', backgroundColor: '#e8f4f8', paddingTop: '15px' }}>
                EKUITAS
              </td>
            </tr>
            {equity.filter(eq => eq.account !== '3-200' && !eq.isContra).map((eq, idx) => {
              const contraAmount = (eq.contraAccounts || []).reduce((sum, c) => sum + (c.amount || 0), 0);
              const netAmount = (eq.amount || 0) - contraAmount;
              
              return (
                <React.Fragment key={idx}>
                  <tr>
                    <td></td>
                    <td></td>
                    <td style={{ paddingLeft: '30px' }}>{eq.name}</td>
                    <td className="number">{eq.amount !== 0 ? formatCurrency(eq.amount) : ''}</td>
                  </tr>
                  {/* Show contra equity accounts if any (like Prive) */}
                  {(eq.contraAccounts || []).filter(c => c.amount !== 0).map((contra, cIdx) => (
                    <tr key={`equity-contra-${idx}-${cIdx}`}>
                      <td></td>
                      <td></td>
                      <td style={{ paddingLeft: '50px', fontStyle: 'italic' }}>
                        Dikurangi: {contra.name}
                      </td>
                      <td className="number" style={{ color: '#d32f2f' }}>
                        {formatCurrency(contra.amount)}
                      </td>
                    </tr>
                  ))}
                  {/* Show net amount if there are contra accounts */}
                  {contraAmount !== 0 && (
                    <tr>
                      <td></td>
                      <td></td>
                      <td style={{ paddingLeft: '30px', fontWeight: 'bold' }}>
                        {eq.name} (Bersih)
                      </td>
                      <td className="number" style={{ fontWeight: 'bold' }}>
                        {formatCurrency(netAmount)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {netIncome !== 0 && (
              <tr>
                <td></td>
                <td></td>
                <td style={{ paddingLeft: '30px' }}>Laba Bersih (belum dibagi)</td>
                <td className="number">{formatCurrency(netIncome)}</td>
              </tr>
            )}
            
            <tr className="total-row" style={{ backgroundColor: '#c8e6c9' }}>
              <td></td>
              <td></td>
              <td style={{ fontWeight: 'bold' }}>Total Ekuitas</td>
              <td className="number">{formatCurrency(totalEquity)}</td>
            </tr>
            
            <tr className="total-row" style={{ backgroundColor: '#ffecb3' }}>
              <td style={{ fontWeight: 'bold', fontSize: '16px' }}>TOTAL AKTIVA</td>
              <td className="number" style={{ fontWeight: 'bold', fontSize: '16px' }}>
                {formatCurrency(totalAssets)}
              </td>
              <td style={{ fontWeight: 'bold', fontSize: '16px' }}>
                TOTAL KEWAJIBAN + EKUITAS
              </td>
              <td className="number" style={{ fontWeight: 'bold', fontSize: '16px' }}>
                {formatCurrency(totalLiabilities + totalEquity)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e8f4f8', borderRadius: '6px' }}>
        <strong>Rumus:</strong>
        <br />
        Aktiva = Kewajiban + Ekuitas
        <br />
        {formatCurrency(totalAssets)} = {formatCurrency(totalLiabilities)} + {formatCurrency(totalEquity)}
      </div>
    </div>
  );
};

export default FinancialPosition;

