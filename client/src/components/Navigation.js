import React from 'react';
import './Navigation.css';

const Navigation = ({ activeReport, setActiveReport }) => {
  const reports = [
    { id: 's0', label: 'COA - Chart of Accounts' },
    { id: 's1', label: 'S1 - Jurnal Umum' },
    { id: 's2', label: 'S2 - Buku Besar' },
    { id: 's3', label: 'S3 - Neraca Saldo' },
    { id: 's4', label: 'S4 - Neraca Saldo Setelah Penyesuaian' },
    { id: 's5', label: 'S5 - Laporan Laba Rugi' },
    { id: 's6', label: 'S6 - Laporan Posisi Keuangan' },
    { id: 's7', label: 'S7 - Laporan Perubahan Ekuitas' }
  ];

  return (
    <nav className="navigation">
      <div className="nav-container">
        {reports.map(report => (
          <button
            key={report.id}
            className={`nav-button ${activeReport === report.id ? 'active' : ''}`}
            onClick={() => setActiveReport(report.id)}
          >
            {report.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;

