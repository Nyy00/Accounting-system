// Vercel Serverless Function for API routes
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Import accounting service
  const { getChartOfAccounts, getTransactions, getAdjustingEntries, calculateReports } = require('../server/services/accountingService');
  
  // Extract path from request
  const path = req.url.replace('/api', '');
  
  try {
    let data;
    
    if (path === '/accounting/transactions') {
      data = getTransactions();
    } else if (path === '/accounting/adjusting-entries') {
      data = getAdjustingEntries();
    } else if (path === '/accounting/chart-of-accounts') {
      data = getChartOfAccounts();
    } else if (path === '/accounting/reports') {
      data = calculateReports();
    } else {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    
    res.status(200).json(data);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
};

