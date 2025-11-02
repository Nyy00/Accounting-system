import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config';
import MetadataEditor from './MetadataEditor';
import './Header.css';

const Header = ({ onMetadataChange }) => {
  const [metadata, setMetadata] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/accounting/metadata`);
      setMetadata(response.data);
      setLoading(false);
      if (onMetadataChange) {
        onMetadataChange(response.data);
      }
    } catch (error) {
      console.error('Error fetching metadata:', error);
      setLoading(false);
    }
  };

  const handleSave = async (updatedMetadata) => {
    setMetadata(updatedMetadata);
    setShowEditor(false);
    if (onMetadataChange) {
      onMetadataChange(updatedMetadata);
    }
  };

  if (loading) {
    return (
      <header className="app-header">
        <div className="header-content">
          <div className="loading">Memuat...</div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-placeholder">
              <span>{metadata?.companyName || 'CV ABC'}</span>
            </div>
          </div>
          <div className="title-section">
            <h1>{metadata?.reportTitle || 'Sistem Akuntansi CV ABC'}</h1>
            <p>{metadata?.periodDetail || 'Laporan Keuangan Bulan Januari 2024'}</p>
          </div>
          <div className="header-actions">
            <button 
              onClick={() => setShowEditor(true)}
              className="btn-edit-metadata"
              title="Edit Informasi Laporan"
              style={{
                background: 'none',
                border: '1px solid #fff',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ✏️ Edit
            </button>
          </div>
        </div>
      </header>
      {showEditor && (
        <MetadataEditor
          metadata={metadata}
          onSave={handleSave}
          onCancel={() => setShowEditor(false)}
        />
      )}
    </>
  );
};

export default Header;

