const express = require('express');
const router = express.Router();
const { 
  getChartOfAccounts, 
  getTransactions, 
  getAdjustingEntries, 
  calculateReports,
  addTransaction,
  addAdjustingEntry,
  deleteTransaction,
  deleteAdjustingEntry,
  updateTransaction,
  updateAdjustingEntry
} = require('../services/accountingService');

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

// Add new transaction
router.post('/transactions', (req, res) => {
  try {
    const transaction = addTransaction(req.body);
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update transaction
router.put('/transactions/:id', (req, res) => {
  try {
    const transaction = updateTransaction(parseInt(req.params.id), req.body);
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete transaction
router.delete('/transactions/:id', (req, res) => {
  try {
    deleteTransaction(parseInt(req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
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

// Add new adjusting entry
router.post('/adjusting-entries', (req, res) => {
  try {
    const entry = addAdjustingEntry(req.body);
    res.json(entry);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update adjusting entry
router.put('/adjusting-entries/:id', (req, res) => {
  try {
    const entry = updateAdjustingEntry(parseInt(req.params.id), req.body);
    res.json(entry);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete adjusting entry
router.delete('/adjusting-entries/:id', (req, res) => {
  try {
    deleteAdjustingEntry(parseInt(req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
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

