require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize database
const { getDatabase } = require('./services/database');
getDatabase(); // This will initialize the schema on first call

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.use(cors());
app.use(express.json());

// Import routes
const accountingRoutes = require('./routes/accounting');

app.use('/api/accounting', accountingRoutes);

// Serve static files from React app
if (NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
    console.log(`💡 Solutions:`);
    console.log(`   1. Close the application using port ${PORT}`);
    console.log(`   2. Or change PORT in .env file`);
    console.log(`   3. Run: netstat -ano | findstr :${PORT} to find the process`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});
