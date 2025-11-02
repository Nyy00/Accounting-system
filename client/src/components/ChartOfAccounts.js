import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config';
import '../App.css';
import { initializeAccountCache, updateAccountCache, removeAccountCache } from '../utils/formatters';

const ChartOfAccounts = ({ onRefresh }) => {
  const [chartOfAccounts, setChartOfAccounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'asset',
    isContra: false
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/accounting/chart-of-accounts`);
      setChartOfAccounts(response.data);
      setLoading(false);
      // Update cache
      initializeAccountCache(response.data);
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingAccount(null);
    setFormData({
      code: '',
      name: '',
      type: 'asset',
      isContra: false
    });
    setShowForm(true);
  };

  const handleEditClick = (account) => {
    setEditingAccount(account);
    setFormData({
      code: account.code,
      name: account.name,
      type: account.type,
      isContra: account.isContra || false
    });
    setShowForm(true);
  };

  const handleDeleteClick = async (code) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus akun ini?')) {
      try {
        await axios.delete(`${API_URL}/api/accounting/accounts/${encodeURIComponent(code)}`);
        removeAccountCache(code);
        fetchAccounts();
      } catch (error) {
        alert('Gagal menghapus akun: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAccount) {
        // Update
        await axios.put(`${API_URL}/api/accounting/accounts/${encodeURIComponent(formData.code)}`, {
          name: formData.name,
          type: formData.type,
          isContra: formData.isContra
        });
        updateAccountCache(formData.code, formData.name);
      } else {
        // Add new
        await axios.post(`${API_URL}/api/accounting/accounts`, formData);
        updateAccountCache(formData.code, formData.name);
      }
      setShowForm(false);
      setEditingAccount(null);
      fetchAccounts();
    } catch (error) {
      alert('Gagal menyimpan akun: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAccount(null);
  };

  const getCategoryName = (type) => {
    const names = {
      asset: 'Aktiva',
      liability: 'Kewajiban',
      equity: 'Ekuitas',
      revenue: 'Pendapatan',
      expense: 'Beban'
    };
    return names[type] || type;
  };

  if (loading) {
    return <div className="loading">Memuat data...</div>;
  }

  const categories = [
    { key: 'assets', label: 'Aktiva', type: 'asset' },
    { key: 'liabilities', label: 'Kewajiban', type: 'liability' },
    { key: 'equity', label: 'Ekuitas', type: 'equity' },
    { key: 'revenue', label: 'Pendapatan', type: 'revenue' },
    { key: 'expenses', label: 'Beban', type: 'expense' }
  ];

  return (
    <div>
      <h2 className="report-title">CHART OF ACCOUNTS</h2>
      <p className="report-subtitle">Daftar Akun</p>
      
      <div className="action-buttons">
        <button onClick={handleAddClick} className="btn-primary">
          + Tambah Akun
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={handleFormCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingAccount ? 'Edit Akun' : 'Tambah Akun Baru'}</h2>
              <button className="modal-close" onClick={handleFormCancel}>×</button>
            </div>
            <form onSubmit={handleFormSubmit} className="metadata-form">
              <div className="form-group">
                <label>Kode Akun:</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  required
                  disabled={!!editingAccount}
                  placeholder="Contoh: 1-100"
                />
                {editingAccount && (
                  <small style={{ color: '#666' }}>Kode akun tidak dapat diubah</small>
                )}
              </div>

              <div className="form-group">
                <label>Nama Akun:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="Contoh: Kas kecil"
                />
              </div>

              <div className="form-group">
                <label>Jenis Akun:</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  required
                >
                  <option value="asset">Aktiva</option>
                  <option value="liability">Kewajiban</option>
                  <option value="equity">Ekuitas</option>
                  <option value="revenue">Pendapatan</option>
                  <option value="expense">Beban</option>
                </select>
              </div>

              {formData.type === 'asset' && (
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isContra}
                      onChange={(e) => setFormData({...formData, isContra: e.target.checked})}
                    />
                    {' '}Akun Kontra (Contra Account)
                  </label>
                  <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                    Contoh: Akumulasi Penyusutan, untuk mengurangi nilai aktiva
                  </small>
                </div>
              )}

              <div className="form-actions">
                <button type="button" onClick={handleFormCancel} className="btn-secondary">
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {categories.map(category => {
        const accounts = chartOfAccounts[category.key] || [];
        if (accounts.length === 0 && !showForm) return null;

        return (
          <div key={category.key} style={{ marginBottom: '30px' }}>
            <h3 style={{ 
              marginBottom: '15px', 
              color: '#4a90e2', 
              fontSize: '18px',
              borderBottom: '2px solid #4a90e2',
              paddingBottom: '8px'
            }}>
              {category.label} ({accounts.length} akun)
            </h3>
            
            {accounts.length === 0 ? (
              <p style={{ color: '#999', fontStyle: 'italic' }}>Belum ada akun</p>
            ) : (
              <div className="table-container">
                <table className="accounting-table">
                  <thead>
                    <tr>
                      <th style={{ width: '150px' }}>Kode</th>
                      <th style={{ width: '400px' }}>Nama Akun</th>
                      <th style={{ width: '120px' }}>Jenis</th>
                      <th style={{ width: '100px' }}>Kontra</th>
                      <th style={{ width: '150px' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((account, idx) => (
                      <tr key={idx}>
                        <td className="text-center">{account.code}</td>
                        <td>{account.name}</td>
                        <td className="text-center">{getCategoryName(account.type)}</td>
                        <td className="text-center">{account.isContra ? 'Ya' : '-'}</td>
                        <td className="text-center">
                          <button 
                            onClick={() => handleEditClick(account)} 
                            className="btn-edit"
                            style={{ marginRight: '5px' }}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(account.code)} 
                            className="btn-delete"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ChartOfAccounts;

