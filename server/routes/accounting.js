const express = require('express');
const router = express.Router();
const { getChartOfAccounts, getTransactions, getAdjustingEntries, calculateReports } = require('../services/accountingService');

// Get chart of accounts
router.get('/chart-of-accounts', (req, res) => {
  try {
    const accounts = getChartOfAccounts();
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get transactions
router.get('/transactions', (req, res) => {
  try {
    const transactions = getTransactions();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get adjusting entries
router.get('/adjusting-entries', (req, res) => {
  try {
    const entries = getAdjustingEntries();
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all reports
router.get('/reports', (req, res) => {
  try {
    const reports = calculateReports();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

