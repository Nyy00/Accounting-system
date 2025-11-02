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

function App() {
  const [activeReport, setActiveReport] = useState('s1');
  const [transactions, setTransactions] = useState([]);
  const [adjustingEntries, setAdjustingEntries] = useState([]);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [transRes, adjRes, reportsRes] = await Promise.all([
        axios.get(`${API_URL}/api/accounting/transactions`),
        axios.get(`${API_URL}/api/accounting/adjusting-entries`),
        axios.get(`${API_URL}/api/accounting/reports`)
      ]);
      
      setTransactions(transRes.data);
      setAdjustingEntries(adjRes.data);
      setReports(reportsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const renderReport = () => {
    if (loading) {
      return <div className="loading">Memuat data...</div>;
    }

    switch (activeReport) {
      case 's1':
        return <GeneralJournal transactions={transactions} onRefresh={fetchData} />;
      case 's2':
        return <GeneralLedger transactions={transactions} adjustingEntries={adjustingEntries} />;
      case 's3':
        return <TrialBalance reports={reports} />;
      case 's4':
        return <AdjustedTrialBalance reports={reports} adjustingEntries={adjustingEntries} onRefresh={fetchData} />;
      case 's5':
        return <IncomeStatement reports={reports} />;
      case 's6':
        return <FinancialPosition reports={reports} />;
      case 's7':
        return <ChangesInEquity reports={reports} />;
      default:
        return <GeneralJournal transactions={transactions} onRefresh={fetchData} />;
    }
  };

  return (
    <div className="App">
      <Header />
      <Navigation activeReport={activeReport} setActiveReport={setActiveReport} />
      <div className="report-container">
        {renderReport()}
      </div>
    </div>
  );
}

export default App;

