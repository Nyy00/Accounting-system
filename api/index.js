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
  const { 
    getChartOfAccounts, 
    getTransactions, 
    getAdjustingEntries, 
    calculateReports,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addAdjustingEntry,
    updateAdjustingEntry,
    deleteAdjustingEntry,
    getMetadata,
    updateMetadata,
    addAccount,
    updateAccount,
    deleteAccount
  } = require('../server/services/accountingService');
  
  // Extract path from request
  const path = req.url.replace('/api', '');
  
  try {
    let data;
    
    // GET endpoints
    if (req.method === 'GET') {
      if (path === '/accounting/transactions') {
        data = getTransactions();
      } else if (path === '/accounting/adjusting-entries') {
        data = getAdjustingEntries();
      } else if (path === '/accounting/chart-of-accounts') {
        data = getChartOfAccounts();
      } else if (path === '/accounting/reports') {
        data = calculateReports();
      } else if (path === '/accounting/metadata') {
        data = getMetadata();
      } else {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      res.status(200).json(data);
      return;
    }
    
    // POST endpoints
    if (req.method === 'POST') {
      if (path === '/accounting/transactions') {
        data = addTransaction(req.body);
        res.status(201).json(data);
        return;
      } else if (path === '/accounting/adjusting-entries') {
        data = addAdjustingEntry(req.body);
        res.status(201).json(data);
        return;
      } else if (path === '/accounting/accounts') {
        data = addAccount(req.body);
        res.status(201).json(data);
        return;
      } else {
        res.status(404).json({ error: 'Not found' });
        return;
      }
    }
    
    // PUT endpoints
    if (req.method === 'PUT') {
      if (path === '/accounting/metadata') {
        data = updateMetadata(req.body);
        res.status(200).json(data);
        return;
      }
      
      // Update account (code is in path)
      const accountMatch = path.match(/\/accounting\/accounts\/(.+)/);
      if (accountMatch) {
        const code = decodeURIComponent(accountMatch[1]);
        data = updateAccount(code, req.body);
        res.status(200).json(data);
        return;
      }
      
      const match = path.match(/\/accounting\/(transactions|adjusting-entries)\/(\d+)/);
      if (match) {
        const type = match[1];
        const id = parseInt(match[2]);
        if (type === 'transactions') {
          data = updateTransaction(id, req.body);
        } else if (type === 'adjusting-entries') {
          data = updateAdjustingEntry(id, req.body);
        }
        res.status(200).json(data);
        return;
      } else {
        res.status(404).json({ error: 'Not found' });
        return;
      }
    }
    
    // DELETE endpoints
    if (req.method === 'DELETE') {
      // Delete account (code is in path)
      const accountMatch = path.match(/\/accounting\/accounts\/(.+)/);
      if (accountMatch) {
        const code = decodeURIComponent(accountMatch[1]);
        deleteAccount(code);
        res.status(200).json({ success: true });
        return;
      }
      
      const match = path.match(/\/accounting\/(transactions|adjusting-entries)\/(\d+)/);
      if (match) {
        const type = match[1];
        const id = parseInt(match[2]);
        if (type === 'transactions') {
          deleteTransaction(id);
        } else if (type === 'adjusting-entries') {
          deleteAdjustingEntry(id);
        }
        res.status(200).json({ success: true });
        return;
      } else {
        res.status(404).json({ error: 'Not found' });
        return;
      }
    }
    
    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    const statusCode = error.message.includes('not found') || error.message.includes('Invalid') || error.message.includes('Unbalanced') ? 400 : 500;
    res.status(statusCode).json({ error: error.message });
  }
};

