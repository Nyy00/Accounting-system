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
  updateAdjustingEntry,
  addAccount,
  updateAccount,
  deleteAccount,
  getMetadata,
  updateMetadata
} = require('../services/accountingService');

// Get chart of accounts
router.get('/chart-of-accounts', async (req, res) => {
  try {
    const accounts = await getChartOfAccounts();
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new account
router.post('/accounts', async (req, res) => {
  try {
    const account = await addAccount(req.body);
    // Return the updated chart of accounts so client can update immediately
    const chartOfAccounts = await getChartOfAccounts();
    res.json({ account, chartOfAccounts });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update account
router.put('/accounts/:code', async (req, res) => {
  try {
    const code = decodeURIComponent(req.params.code);
    const account = await updateAccount(code, req.body);
    // Return the updated chart of accounts so client can update immediately
    const chartOfAccounts = await getChartOfAccounts();
    res.json({ account, chartOfAccounts });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete account
router.delete('/accounts/:code', async (req, res) => {
  try {
    const code = decodeURIComponent(req.params.code);
    await deleteAccount(code);
    // Return the updated chart of accounts so client can update immediately
    const chartOfAccounts = await getChartOfAccounts();
    res.json({ success: true, chartOfAccounts });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get transactions
router.get('/transactions', async (req, res) => {
  try {
    const transactions = await getTransactions();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new transaction
router.post('/transactions', async (req, res) => {
  try {
    const transaction = await addTransaction(req.body);
    // Return updated transactions list for real-time sync
    const transactions = await getTransactions();
    res.json({ transaction, transactions });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update transaction
router.put('/transactions/:id', async (req, res) => {
  try {
    const transaction = await updateTransaction(parseInt(req.params.id), req.body);
    // Return updated transactions list for real-time sync
    const transactions = await getTransactions();
    res.json({ transaction, transactions });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete transaction
router.delete('/transactions/:id', async (req, res) => {
  try {
    await deleteTransaction(parseInt(req.params.id));
    // Return updated transactions list for real-time sync
    const transactions = await getTransactions();
    res.json({ success: true, transactions });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get adjusting entries
router.get('/adjusting-entries', async (req, res) => {
  try {
    const entries = await getAdjustingEntries();
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new adjusting entry
router.post('/adjusting-entries', async (req, res) => {
  try {
    const entry = await addAdjustingEntry(req.body);
    // Return updated adjusting entries list for real-time sync
    const adjustingEntries = await getAdjustingEntries();
    res.json({ entry, adjustingEntries });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update adjusting entry
router.put('/adjusting-entries/:id', async (req, res) => {
  try {
    const entry = await updateAdjustingEntry(parseInt(req.params.id), req.body);
    // Return updated adjusting entries list for real-time sync
    const adjustingEntries = await getAdjustingEntries();
    res.json({ entry, adjustingEntries });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete adjusting entry
router.delete('/adjusting-entries/:id', async (req, res) => {
  try {
    await deleteAdjustingEntry(parseInt(req.params.id));
    // Return updated adjusting entries list for real-time sync
    const adjustingEntries = await getAdjustingEntries();
    res.json({ success: true, adjustingEntries });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all reports
router.get('/reports', async (req, res) => {
  try {
    const reports = await calculateReports();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get metadata
router.get('/metadata', async (req, res) => {
  try {
    const metadata = await getMetadata();
    res.json(metadata);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update metadata
router.put('/metadata', async (req, res) => {
  try {
    const metadata = await updateMetadata(req.body);
    res.json(metadata);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

