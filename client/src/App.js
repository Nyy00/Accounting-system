import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import API_URL from './config';
import Header from './components/Header';
import Navigation from './components/Navigation';
import GeneralJournal from './components/reports/GeneralJournal';
import GeneralLedger from './components/reports/GeneralLedger';
import TrialBalance from './components/reports/TrialBalance';
import AdjustedTrialBalance from './components/reports/AdjustedTrialBalance';
import IncomeStatement from './components/reports/IncomeStatement';
import FinancialPosition from './components/reports/FinancialPosition';
import ChangesInEquity from './components/reports/ChangesInEquity';
import ChartOfAccounts from './components/ChartOfAccounts';
import { initializeAccountCache } from './utils/formatters';

function App() {
  const [activeReport, setActiveReport] = useState('s0');
  const [transactions, setTransactions] = useState([]);
  const [adjustingEntries, setAdjustingEntries] = useState([]);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState(null);
  const [processingNextStage, setProcessingNextStage] = useState(false); // ✅ NEW: Loading state

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transRes, adjRes, reportsRes, coaRes, metaRes] = await Promise.all([
        axios.get(`${API_URL}/api/accounting/transactions`),
        axios.get(`${API_URL}/api/accounting/adjusting-entries`),
        axios.get(`${API_URL}/api/accounting/reports`),
        axios.get(`${API_URL}/api/accounting/chart-of-accounts`),
        axios.get(`${API_URL}/api/accounting/metadata`).catch(() => ({ data: null }))
      ]);
      
      // Ensure data is array, not null/undefined
      setTransactions(Array.isArray(transRes.data) ? transRes.data : []);
      setAdjustingEntries(Array.isArray(adjRes.data) ? adjRes.data : []);
      setReports(reportsRes.data);
      // Initialize account name cache
      initializeAccountCache(coaRes.data);
      if (metaRes.data) {
        setMetadata(metaRes.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set defaults on error
      setTransactions([]);
      setAdjustingEntries([]);
      setLoading(false);
    }
  };

  // ✅ IMPROVED: handleNextStage dengan loading state dan error handling
  const handleNextStage = async (currentStage) => {
    try {
      // Set loading state
      setProcessingNextStage(true);
      
      // Refresh data before moving to next stage
      await fetchData();
      
      // Small delay untuk memastikan UI terupdate
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Navigate to next stage
      const stages = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'];
      const currentIndex = stages.indexOf(currentStage);
      
      if (currentIndex < stages.length - 1) {
        const nextStage = stages[currentIndex + 1];
        setActiveReport(nextStage);
        
        // Scroll to top untuk user experience yang lebih baik
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Optional: Show success notification
        console.log(`✅ Berhasil pindah dari ${currentStage.toUpperCase()} ke ${nextStage.toUpperCase()}`);
      } else {
        // Already at last stage
        alert('Anda sudah berada di tahap terakhir (S7 - Laporan Perubahan Ekuitas)');
      }
    } catch (error) {
      console.error('Error pada handleNextStage:', error);
      alert('Terjadi kesalahan saat memproses ke tahap selanjutnya. Silakan coba lagi.');
    } finally {
      setProcessingNextStage(false);
    }
  };

  const renderReport = () => {
    if (loading) {
      return <div className="loading">Memuat data...</div>;
    }

    // ✅ NEW: Show loading overlay saat processing next stage
    if (processingNextStage) {
      return (
        <div style={{
          padding: '60px',
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          margin: '20px 0'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <h3 style={{ color: '#667eea', marginBottom: '10px' }}>Memproses ke tahap selanjutnya...</h3>
          <p style={{ color: '#6c757d' }}>Mohon tunggu sebentar</p>
        </div>
      );
    }

    switch (activeReport) {
      case 's0':
        return <ChartOfAccounts onRefresh={fetchData} />;
      case 's1':
        return <GeneralJournal transactions={transactions} onRefresh={fetchData} onNextStage={() => handleNextStage('s1')} metadata={metadata} />;
      case 's2':
        return <GeneralLedger transactions={transactions} adjustingEntries={adjustingEntries} onNextStage={() => handleNextStage('s2')} metadata={metadata} />;
      case 's3':
        return <TrialBalance reports={reports} onNextStage={() => handleNextStage('s3')} metadata={metadata} />;
      case 's4':
        return <AdjustedTrialBalance reports={reports} adjustingEntries={adjustingEntries} onRefresh={fetchData} onNextStage={() => handleNextStage('s4')} metadata={metadata} />;
      case 's5':
        return <IncomeStatement reports={reports} onNextStage={() => handleNextStage('s5')} metadata={metadata} />;
      case 's6':
        return <FinancialPosition reports={reports} onNextStage={() => handleNextStage('s6')} metadata={metadata} />;
      case 's7':
        return <ChangesInEquity reports={reports} metadata={metadata} />;
      default:
        return <ChartOfAccounts onRefresh={fetchData} />;
    }
  };

  return (
    <div className="App">
      <Header onMetadataChange={setMetadata} />
      <Navigation activeReport={activeReport} setActiveReport={setActiveReport} />
      <div className="report-container">
        {renderReport()}
      </div>
    </div>
  );
}

export default App;