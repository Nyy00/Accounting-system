import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../App.css';
import TransactionForm from '../TransactionForm';
import API_URL from '../../config';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const AdjustedTrialBalance = ({ reports, adjustingEntries, onRefresh, onNextStage, metadata }) => {
  const [showAdjustingForm, setShowAdjustingForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [view, setView] = useState('report'); // 'report' or 'adjusting'
  const [localAdjustingEntries, setLocalAdjustingEntries] = useState([]);

  // Sync local state with props for real-time updates
  useEffect(() => {
    setLocalAdjustingEntries(adjustingEntries || []);
  }, [adjustingEntries]);

  const handleAddAdjustingClick = () => {
    setEditingEntry(null);
    setShowAdjustingForm(true);
  };

  const handleEditAdjustingClick = (entry) => {
    setEditingEntry(entry);
    setShowAdjustingForm(true);
  };

  const handleDeleteAdjustingClick = async (entryId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus jurnal penyesuaian ini?')) {
      // Optimistically remove from UI immediately (real-time update)
      setLocalAdjustingEntries(prev => prev.filter(e => e.id !== entryId));
      
      try {
        await axios.delete(`${API_URL}/api/accounting/adjusting-entries/${entryId}`);
        // Refresh to sync with server and update other components
        if (onRefresh) {
          onRefresh();
        }
      } catch (error) {
        // On error, restore the entry and show error
        if (onRefresh) {
          onRefresh(); // Refresh to get correct state from server
        }
        alert('Gagal menghapus jurnal penyesuaian: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const handleFormClose = () => {
    setShowAdjustingForm(false);
    setEditingEntry(null);
  };

  const handleFormSave = () => {
    setShowAdjustingForm(false);
    setEditingEntry(null);
    if (onRefresh) {
      onRefresh();
    }
  };

  if (!reports || !reports.adjustedTrialBalance) {
    return <div>Memuat data...</div>;
  }

  const totalDebit = reports.adjustedTrialBalance.reduce((sum, acc) => sum + acc.debit, 0);
  const totalCredit = reports.adjustedTrialBalance.reduce((sum, acc) => sum + acc.credit, 0);

  const renderReport = () => (
    <>
      <div className="action-buttons" style={{ marginBottom: '20px' }}>
        {onNextStage && (
          <button 
            onClick={onNextStage} 
            className="btn-success"
            style={{ backgroundColor: '#28a745', color: 'white' }}
          >
            ➜ Proses ke Tahap Selanjutnya (S5 - Laporan Laba Rugi)
          </button>
        )}
      </div>
      
      {localAdjustingEntries && localAdjustingEntries.length > 0 && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fff9e6', borderRadius: '6px', border: '1px solid #ffd700' }}>
          <h3 style={{ marginBottom: '10px', color: '#b8860b' }}>Jurnal Penyesuaian:</h3>
          <ul style={{ marginLeft: '20px' }}>
            {localAdjustingEntries.map((adj, idx) => (
              <li key={adj.id || idx} style={{ marginBottom: '5px' }}>
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
    </>
  );

  const renderAdjustingEntries = () => (
    <>
      <div className="action-buttons">
        <button onClick={handleAddAdjustingClick} className="btn-primary">
          + Tambah Jurnal Penyesuaian
        </button>
      </div>

      {showAdjustingForm && (
        <TransactionForm
          editingTransaction={editingEntry}
          onSave={handleFormSave}
          onCancel={handleFormClose}
          type="adjusting"
        />
      )}

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
              <th style={{ width: '120px' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {localAdjustingEntries && localAdjustingEntries.map((entry, idx) => (
              <React.Fragment key={entry.id || idx}>
                <tr>
                  <td rowSpan={entry.entries.length} className="text-center">
                    {new Date(entry.date).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </td>
                  <td rowSpan={entry.entries.length}>
                    {entry.description}
                  </td>
                  <td className="text-center">{entry.entries[0].account}</td>
                  <td>{getAccountName(entry.entries[0].account)}</td>
                  <td className="number">{entry.entries[0].debit > 0 ? formatCurrency(entry.entries[0].debit) : ''}</td>
                  <td className="number">{entry.entries[0].credit > 0 ? formatCurrency(entry.entries[0].credit) : ''}</td>
                  <td rowSpan={entry.entries.length} className="text-center">
                    <button onClick={() => handleEditAdjustingClick(entry)} className="btn-edit">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteAdjustingClick(entry.id)} className="btn-delete">
                      Hapus
                    </button>
                  </td>
                </tr>
                {entry.entries.slice(1).map((e, entryIdx) => (
                  <tr key={entryIdx}>
                    <td className="text-center">{e.account}</td>
                    <td>{getAccountName(e.account)}</td>
                    <td className="number">{e.debit > 0 ? formatCurrency(e.debit) : ''}</td>
                    <td className="number">{e.credit > 0 ? formatCurrency(e.credit) : ''}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

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

  return (
    <div>
      <h2 className="report-title">S4 - NERACA SALDO SETELAH PENYESUAIAN</h2>
      <p className="report-subtitle">Periode: {metadata?.period || 'Januari 2024'}</p>
      {metadata?.createdBy && (
        <p style={{ textAlign: 'right', marginTop: '10px', fontStyle: 'italic', color: '#666' }}>
          Dibuat oleh: {metadata.createdBy}
        </p>
      )}
      
      <div className="action-buttons">
        <button 
          onClick={() => setView('adjusting')} 
          className={view === 'adjusting' ? 'btn-primary' : 'btn-secondary'}
          style={{ marginRight: '10px' }}
        >
          Kelola Jurnal Penyesuaian
        </button>
        <button 
          onClick={() => setView('report')} 
          className={view === 'report' ? 'btn-primary' : 'btn-secondary'}
        >
          Lihat Laporan
        </button>
      </div>

      {view === 'report' ? renderReport() : renderAdjustingEntries()}
    </div>
  );
};

export default AdjustedTrialBalance;

