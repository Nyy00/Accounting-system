import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../App.css';
import TransactionForm from '../TransactionForm';
import API_URL from '../../config';
import { getAccountName } from '../../utils/formatters';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const GeneralJournal = ({ transactions, onRefresh, onNextStage, metadata }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [localTransactions, setLocalTransactions] = useState([]);

  // Sync local state with props for real-time updates
  useEffect(() => {
    setLocalTransactions(transactions);
  }, [transactions]);

  const handleAddClick = () => {
    setEditingTransaction(null);
    setShowForm(true);
  };

  const handleEditClick = (transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDeleteClick = async (transactionId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      try {
        const response = await axios.delete(`${API_URL}/api/accounting/transactions/${transactionId}`);
        // Update local state immediately with response data
        if (response.data && response.data.transactions) {
          setLocalTransactions(response.data.transactions);
        } else if (onRefresh) {
          onRefresh();
        }
      } catch (error) {
        // On error, refresh to get correct state from server
        if (onRefresh) {
          onRefresh();
        }
        alert('Gagal menghapus transaksi: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  const handleFormSave = (responseData) => {
    setShowForm(false);
    setEditingTransaction(null);
    
    // Update local state immediately if response contains updated list
    if (responseData) {
      if (responseData.transactions) {
        setLocalTransactions(responseData.transactions);
      } else if (responseData.adjustingEntries) {
        // For adjusting entries, trigger parent refresh
        if (onRefresh) {
          onRefresh();
        }
      }
    }
    
    // Always refresh parent to sync other components
    if (onRefresh) {
      onRefresh();
    }
  };

  // ✅ FIX: Handler untuk next stage dengan loading state
  const handleNextStageClick = async () => {
    try {
      // Refresh data terlebih dahulu
      if (onRefresh) {
        await onRefresh();
      }
      
      // Tunggu sebentar agar data ter-update
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Navigasi ke stage selanjutnya
      if (onNextStage) {
        onNextStage();
      }
    } catch (error) {
      console.error('Error pada next stage:', error);
      alert('Terjadi kesalahan saat memproses ke tahap selanjutnya');
    }
  };

  return (
    <div>
      <h2 className="report-title">S1 - JURNAL UMUM</h2>
      <p className="report-subtitle">Periode: {metadata?.period || 'Januari 2024'}</p>
      {metadata?.createdBy && (
        <p style={{ textAlign: 'right', marginTop: '10px', fontStyle: 'italic', color: '#666' }}>
          Dibuat oleh: {metadata.createdBy}
        </p>
      )}
      
      <div className="action-buttons">
        <button onClick={handleAddClick} className="btn-primary">
          + Tambah Transaksi
        </button>
        
        {/* ✅ FIX: Button selalu muncul, dengan kondisi disabled jika tidak ada transaksi */}
        <button 
          onClick={handleNextStageClick}
          className="btn-success"
          style={{ 
            marginLeft: '10px', 
            backgroundColor: localTransactions.length > 0 ? '#28a745' : '#ccc', 
            color: 'white',
            cursor: localTransactions.length > 0 ? 'pointer' : 'not-allowed'
          }}
          disabled={localTransactions.length === 0}
          title={localTransactions.length === 0 ? 'Tambahkan minimal 1 transaksi terlebih dahulu' : 'Lanjut ke S2 - Buku Besar'}
        >
          ➜ Proses ke Tahap Selanjutnya (S2 - Buku Besar)
        </button>
      </div>
      
      {showForm && (
        <TransactionForm
          editingTransaction={editingTransaction}
          onSave={handleFormSave}
          onCancel={handleFormClose}
        />
      )}
      
      {/* ✅ FIX: Tampilkan pesan jika tidak ada transaksi */}
      {localTransactions.length === 0 && (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px', 
          margin: '20px 0',
          border: '2px dashed #dee2e6'
        }}>
          <p style={{ fontSize: '18px', color: '#6c757d', marginBottom: '10px' }}>
            📝 Belum ada transaksi
          </p>
          <p style={{ fontSize: '14px', color: '#6c757d' }}>
            Klik tombol "+ Tambah Transaksi" untuk memulai mencatat jurnal umum
          </p>
        </div>
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
            {localTransactions.map((transaction, idx) => (
              <React.Fragment key={transaction.id || idx}>
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
                  <td rowSpan={transaction.entries.length} className="text-center">
                    <button onClick={() => handleEditClick(transaction)} className="btn-edit">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteClick(transaction.id)} className="btn-delete">
                      Hapus
                    </button>
                  </td>
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

export default GeneralJournal;