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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [transRes, adjRes, reportsRes, coaRes] = await Promise.all([
        axios.get(`${API_URL}/api/accounting/transactions`),
        axios.get(`${API_URL}/api/accounting/adjusting-entries`),
        axios.get(`${API_URL}/api/accounting/reports`),
        axios.get(`${API_URL}/api/accounting/chart-of-accounts`)
      ]);
      
      setTransactions(transRes.data);
      setAdjustingEntries(adjRes.data);
      setReports(reportsRes.data);
      // Initialize account name cache
      initializeAccountCache(coaRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleNextStage = async (currentStage) => {
    // Refresh data before moving to next stage
    await fetchData();
    
    // Navigate to next stage
    const stages = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'];
    const currentIndex = stages.indexOf(currentStage);
    if (currentIndex < stages.length - 1) {
      setActiveReport(stages[currentIndex + 1]);
    }
  };

  const renderReport = () => {
    if (loading) {
      return <div className="loading">Memuat data...</div>;
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

