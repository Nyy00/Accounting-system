// Vercel Serverless Function for API routes
module.exports = async (req, res) => {
  // Initialize database connection and schema (only once, silently handle conflicts)
  try {
    const { getDatabase } = require('../server/services/database');
    getDatabase(); // This will initialize the database connection
    
    // Initialize schema if using Neon or Postgres (don't wait, let it run async)
    const { getDbType } = require('../server/services/db-adapter');
    const dbType = getDbType();
    if (dbType === 'neon' || dbType === 'postgres' || dbType === 'supabase') {
      // Run schema init in background, ignore errors (might be concurrent requests)
      const { initializeSchema } = require('../server/services/postgres-adapter');
      initializeSchema().catch(() => {
        // Silently ignore - schema might already be initialized or being initialized by another request
      });
    }
  } catch (error) {
    // Silently continue - database might already be initialized
  }

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
        data = await getTransactions();
      } else if (path === '/accounting/adjusting-entries') {
        data = await getAdjustingEntries();
      } else if (path === '/accounting/chart-of-accounts') {
        data = await getChartOfAccounts();
      } else if (path === '/accounting/reports') {
        data = await calculateReports();
      } else if (path === '/accounting/metadata') {
        data = await getMetadata();
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
        data = await addTransaction(req.body);
        res.status(201).json(data);
        return;
      } else if (path === '/accounting/adjusting-entries') {
        data = await addAdjustingEntry(req.body);
        res.status(201).json(data);
        return;
      } else if (path === '/accounting/accounts') {
        data = await addAccount(req.body);
        const chartOfAccounts = await getChartOfAccounts();
        res.status(201).json({ account: data, chartOfAccounts });
        return;
      } else {
        res.status(404).json({ error: 'Not found' });
        return;
      }
    }
    
    // PUT endpoints
    if (req.method === 'PUT') {
      if (path === '/accounting/metadata') {
        data = await updateMetadata(req.body);
        res.status(200).json(data);
        return;
      }
      
      // Update account (code is in path)
      const accountMatch = path.match(/\/accounting\/accounts\/(.+)/);
      if (accountMatch) {
        const code = decodeURIComponent(accountMatch[1]);
        data = await updateAccount(code, req.body);
        const chartOfAccounts = await getChartOfAccounts();
        res.status(200).json({ account: data, chartOfAccounts });
        return;
      }
      
      const match = path.match(/\/accounting\/(transactions|adjusting-entries)\/(\d+)/);
      if (match) {
        const type = match[1];
        const id = parseInt(match[2]);
        if (type === 'transactions') {
          data = await updateTransaction(id, req.body);
          const transactions = await getTransactions();
          res.status(200).json({ transaction: data, transactions });
        } else if (type === 'adjusting-entries') {
          data = await updateAdjustingEntry(id, req.body);
          const adjustingEntries = await getAdjustingEntries();
          res.status(200).json({ entry: data, adjustingEntries });
        }
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
        await deleteAccount(code);
        const chartOfAccounts = await getChartOfAccounts();
        res.status(200).json({ success: true, chartOfAccounts });
        return;
      }
      
      const match = path.match(/\/accounting\/(transactions|adjusting-entries)\/(\d+)/);
      if (match) {
        const type = match[1];
        const id = parseInt(match[2]);
        if (type === 'transactions') {
          await deleteTransaction(id);
          const transactions = await getTransactions();
          res.status(200).json({ success: true, transactions });
        } else if (type === 'adjusting-entries') {
          await deleteAdjustingEntry(id);
          const adjustingEntries = await getAdjustingEntries();
          res.status(200).json({ success: true, adjustingEntries });
        }
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

