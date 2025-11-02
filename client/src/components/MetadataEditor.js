import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config';
import '../App.css';

const MetadataEditor = ({ metadata, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    reportTitle: '',
    period: '',
    periodDetail: '',
    createdBy: '',
    date: ''
  });

  useEffect(() => {
    if (metadata) {
      setFormData({
        companyName: metadata.companyName || '',
        reportTitle: metadata.reportTitle || '',
        period: metadata.period || '',
        periodDetail: metadata.periodDetail || '',
        createdBy: metadata.createdBy || '',
        date: metadata.date || new Date().toISOString().split('T')[0]
      });
    }
  }, [metadata]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/api/accounting/metadata`, formData);
      if (onSave) {
        onSave(formData);
      }
    } catch (error) {
      alert('Gagal menyimpan metadata: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Informasi Laporan</h2>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="metadata-form">
          <div className="form-group">
            <label>Nama Perusahaan:</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
              placeholder="Contoh: CV ABC"
            />
          </div>

          <div className="form-group">
            <label>Judul Laporan:</label>
            <input
              type="text"
              name="reportTitle"
              value={formData.reportTitle}
              onChange={handleChange}
              required
              placeholder="Contoh: Sistem Akuntansi CV ABC"
            />
          </div>

          <div className="form-group">
            <label>Periode (Singkat):</label>
            <input
              type="text"
              name="period"
              value={formData.period}
              onChange={handleChange}
              required
              placeholder="Contoh: Januari 2024"
            />
          </div>

          <div className="form-group">
            <label>Periode (Detail):</label>
            <input
              type="text"
              name="periodDetail"
              value={formData.periodDetail}
              onChange={handleChange}
              required
              placeholder="Contoh: Bulan Januari 2024"
            />
          </div>

          <div className="form-group">
            <label>Nama Pembuat:</label>
            <input
              type="text"
              name="createdBy"
              value={formData.createdBy}
              onChange={handleChange}
              placeholder="Masukkan nama pembuat laporan"
            />
          </div>

          <div className="form-group">
            <label>Tanggal:</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn-primary">
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MetadataEditor;

