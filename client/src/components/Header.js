import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-section">
          <div className="logo-placeholder">
            <span>CV ABC</span>
          </div>
        </div>
        <div className="title-section">
          <h1>Sistem Akuntansi CV ABC</h1>
          <p>Laporan Keuangan Bulan Januari 2024</p>
        </div>
      </div>
    </header>
  );
};

export default Header;

