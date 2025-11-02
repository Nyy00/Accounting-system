import React, { useMemo } from 'react';
import '../../App.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
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

const GeneralLedger = ({ transactions, adjustingEntries, onNextStage, metadata }) => {
  const ledgerData = useMemo(() => {
    const accounts = {};
    
    // Process regular transactions
    transactions.forEach(trans => {
      trans.entries.forEach(entry => {
        if (!accounts[entry.account]) {
          accounts[entry.account] = {
            code: entry.account,
            name: getAccountName(entry.account),
            entries: []
          };
        }
        accounts[entry.account].entries.push({
          date: trans.date,
          description: trans.description,
          debit: entry.debit,
          credit: entry.credit,
          type: 'regular'
        });
      });
    });
    
    // Process adjusting entries
    adjustingEntries.forEach(adj => {
      adj.entries.forEach(entry => {
        if (!accounts[entry.account]) {
          accounts[entry.account] = {
            code: entry.account,
            name: getAccountName(entry.account),
            entries: []
          };
        }
        accounts[entry.account].entries.push({
          date: adj.date,
          description: adj.description,
          debit: entry.debit,
          credit: entry.credit,
          type: 'adjustment'
        });
      });
    });
    
    // Calculate running balances
    Object.keys(accounts).forEach(code => {
      const acc = accounts[code];
      let balance = 0;
      let totalDebit = 0;
      let totalCredit = 0;
      
      acc.entries.forEach(entry => {
        totalDebit += entry.debit;
        totalCredit += entry.credit;
        
        // Determine account type for balance calculation
        const accountType = code.split('-')[0];
        if (['1', '5'].includes(accountType)) {
          balance = totalDebit - totalCredit;
        } else {
          balance = totalCredit - totalDebit;
        }
        
        entry.runningBalance = balance;
      });
      
      acc.totalDebit = totalDebit;
      acc.totalCredit = totalCredit;
      acc.finalBalance = balance;
    });
    
    return Object.values(accounts);
  }, [transactions, adjustingEntries]);

  return (
    <div>
      <h2 className="report-title">S2 - BUKU BESAR</h2>
      <p className="report-subtitle">Periode: {metadata?.period || 'Januari 2024'}</p>
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
            ➜ Proses ke Tahap Selanjutnya (S3 - Neraca Saldo)
          </button>
        )}
      </div>
      
      {ledgerData.map((account, idx) => (
        <div key={idx} style={{ marginBottom: '40px' }}>
          <h3 style={{ marginBottom: '10px', color: '#4a90e2' }}>
            {account.code} - {account.name}
          </h3>
          
          <div className="table-container">
            <table className="accounting-table">
              <thead>
                <tr>
                  <th style={{ width: '100px' }}>Tanggal</th>
                  <th style={{ width: '300px' }}>Keterangan</th>
                  <th style={{ width: '150px' }}>Debit (Rp)</th>
                  <th style={{ width: '150px' }}>Kredit (Rp)</th>
                  <th style={{ width: '150px' }}>Saldo (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {account.entries.map((entry, entryIdx) => (
                  <tr key={entryIdx} className={entry.type === 'adjustment' ? 'formula-cell' : ''}>
                    <td className="text-center">
                      {new Date(entry.date).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </td>
                    <td>
                      {entry.description}
                      {entry.type === 'adjustment' && (
                        <span className="formula-indicator"> (Penyesuaian)</span>
                      )}
                    </td>
                    <td className="number">{entry.debit > 0 ? formatCurrency(entry.debit) : ''}</td>
                    <td className="number">{entry.credit > 0 ? formatCurrency(entry.credit) : ''}</td>
                    <td className="number">{formatCurrency(entry.runningBalance)}</td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td colSpan="2" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total / Saldo Akhir:</td>
                  <td className="number">{formatCurrency(account.totalDebit)}</td>
                  <td className="number">{formatCurrency(account.totalCredit)}</td>
                  <td className="number">{formatCurrency(account.finalBalance)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GeneralLedger;

