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
      // Optimistically remove from UI immediately (real-time update)
      setLocalTransactions(prev => prev.filter(t => t.id !== transactionId));
      
      try {
        await axios.delete(`${API_URL}/api/accounting/transactions/${transactionId}`);
        // Refresh to sync with server and update other components
        if (onRefresh) {
          onRefresh();
        }
      } catch (error) {
        // On error, restore the transaction and show error
        if (onRefresh) {
          onRefresh(); // Refresh to get correct state from server
        }
        alert('Gagal menghapus transaksi: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  const handleFormSave = () => {
    setShowForm(false);
    setEditingTransaction(null);
    if (onRefresh) {
      onRefresh();
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
        {localTransactions.length > 0 && (
          <button 
            onClick={async () => {
              if (onRefresh) {
                await onRefresh();
              }
              if (onNextStage) {
                onNextStage();
              }
            }} 
            className="btn-success"
            style={{ marginLeft: '10px', backgroundColor: '#28a745', color: 'white' }}
          >
            ➜ Proses ke Tahap Selanjutnya (S2 - Buku Besar)
          </button>
        )}
      </div>
      
      {showForm && (
        <TransactionForm
          editingTransaction={editingTransaction}
          onSave={handleFormSave}
          onCancel={handleFormClose}
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

