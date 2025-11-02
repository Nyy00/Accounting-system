import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config';
import '../App.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const formatNumber = (num) => {
  if (!num) return '';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const parseNumber = (str) => {
  if (!str) return 0;
  return parseInt(str.replace(/\./g, '')) || 0;
};

const TransactionForm = ({ onSave, onCancel, editingTransaction = null, type = 'transaction' }) => {
  const [accounts, setAccounts] = useState([]);
  const [date, setDate] = useState(editingTransaction?.date || new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState(editingTransaction?.description || '');
  const [entries, setEntries] = useState(editingTransaction?.entries || [{ account: '', debit: 0, credit: 0 }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/accounting/chart-of-accounts`);
      const allAccounts = [
        ...response.data.assets,
        ...response.data.liabilities,
        ...response.data.equity,
        ...response.data.revenue,
        ...response.data.expenses
      ];
      setAccounts(allAccounts);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const handleAddEntry = () => {
    setEntries([...entries, { account: '', debit: 0, credit: 0 }]);
  };

  const handleRemoveEntry = (index) => {
    if (entries.length > 1) {
      const newEntries = entries.filter((_, i) => i !== index);
      setEntries(newEntries);
    }
  };

  const handleEntryChange = (index, field, value) => {
    const newEntries = [...entries];
    if (field === 'account') {
      newEntries[index].account = value;
      newEntries[index].debit = 0;
      newEntries[index].credit = 0;
    } else {
      const numValue = parseNumber(value);
      if (field === 'debit') {
        newEntries[index].debit = numValue;
        newEntries[index].credit = 0;
      } else if (field === 'credit') {
        newEntries[index].credit = numValue;
        newEntries[index].debit = 0;
      }
    }
    setEntries(newEntries);
  };

  const calculateBalance = () => {
    const totalDebit = entries.reduce((sum, e) => sum + (e.debit || 0), 0);
    const totalCredit = entries.reduce((sum, e) => sum + (e.credit || 0), 0);
    return { totalDebit, totalCredit, balance: totalDebit - totalCredit };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!date || !description) {
      setError('Tanggal dan keterangan harus diisi');
      return;
    }

    if (entries.length < 2) {
      setError('Minimal harus ada 2 akun dalam setiap transaksi');
      return;
    }

    const balance = calculateBalance();
    if (balance.balance !== 0) {
      setError(`Transaksi tidak seimbang. Debit: ${formatCurrency(balance.totalDebit)}, Kredit: ${formatCurrency(balance.totalCredit)}`);
      return;
    }

    setLoading(true);
    try {
      const transactionData = {
        date,
        description,
        entries
      };

      const endpoint = type === 'adjusting' ? 'adjusting-entries' : 'transactions';
      
      let response;
      if (editingTransaction) {
        response = await axios.put(`${API_URL}/api/accounting/${endpoint}/${editingTransaction.id}`, transactionData);
      } else {
        response = await axios.post(`${API_URL}/api/accounting/${endpoint}`, transactionData);
      }
      
      // Pass response data to onSave callback if available
      onSave(response.data);
    } catch (error) {
      const errorMsg = type === 'adjusting' ? 'Gagal menyimpan jurnal penyesuaian' : 'Gagal menyimpan transaksi';
      setError(error.response?.data?.error || errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const balance = calculateBalance();

  const title = type === 'adjusting' 
    ? (editingTransaction ? 'Edit Jurnal Penyesuaian' : 'Tambah Jurnal Penyesuaian Baru')
    : (editingTransaction ? 'Edit Transaksi' : 'Tambah Transaksi Baru');

  return (
    <div className="form-overlay">
      <div className="form-modal">
        <h3>{title}</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tanggal:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Keterangan:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={2}
            />
          </div>

          <div className="form-group">
            <label>Jurnal Entries:</label>
            <div className="entries-container">
              {entries.map((entry, index) => (
                <div key={index} className="entry-row">
                  <select
                    value={entry.account}
                    onChange={(e) => handleEntryChange(index, 'account', e.target.value)}
                    required
                  >
                    <option value="">Pilih Akun</option>
                    {accounts.map(acc => (
                      <option key={acc.code} value={acc.code}>
                        {acc.code} - {acc.name}
                      </option>
                    ))}
                  </select>
                  
                  <input
                    type="text"
                    placeholder="Debit"
                    value={formatNumber(entry.debit)}
                    onChange={(e) => handleEntryChange(index, 'debit', e.target.value)}
                    className="debit-input"
                  />
                  
                  <input
                    type="text"
                    placeholder="Kredit"
                    value={formatNumber(entry.credit)}
                    onChange={(e) => handleEntryChange(index, 'credit', e.target.value)}
                    className="credit-input"
                  />
                  
                  <button
                    type="button"
                    onClick={() => handleRemoveEntry(index)}
                    disabled={entries.length === 1}
                    className="btn-remove"
                  >
                    Hapus
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={handleAddEntry}
                className="btn-add-entry"
              >
                + Tambah Akun
              </button>
            </div>
          </div>

          <div className="balance-summary">
            <div className="balance-row">
              <span>Total Debit:</span>
              <span className={balance.totalDebit > 0 ? 'positive' : ''}>
                {formatCurrency(balance.totalDebit)}
              </span>
            </div>
            <div className="balance-row">
              <span>Total Kredit:</span>
              <span className={balance.totalCredit > 0 ? 'positive' : ''}>
                {formatCurrency(balance.totalCredit)}
              </span>
            </div>
            <div className="balance-row">
              <span>Selisih:</span>
              <span className={balance.balance !== 0 ? 'negative' : 'balance-ok'}>
                {formatCurrency(balance.balance)}
              </span>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button type="button" onClick={onCancel} className="btn-secondary">
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;

