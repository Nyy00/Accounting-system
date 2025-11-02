/**
 * PostgreSQL Adapter for Vercel Postgres
 * Converts SQLite-style queries to PostgreSQL
 */

let client = null;
let initialized = false;

const initPostgres = async () => {
  if (initialized) return;
  
  try {
    const { createClient } = require('@vercel/postgres');
    client = createClient();
    initialized = true;
    
    // Initialize schema
    await initializeSchema();
    console.log('✅ Vercel Postgres initialized');
  } catch (error) {
    console.error('Error initializing Postgres:', error);
    throw error;
  }
};

const initializeSchema = async () => {
  // Check if using Neon
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech')) {
    try {
      const { neon } = require('@neondatabase/serverless');
      const sql = neon(process.env.DATABASE_URL);
      
      // Create tables for Neon
      await sql(`
        CREATE TABLE IF NOT EXISTS chart_of_accounts (
          code TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          type TEXT NOT NULL CHECK(type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
          is_contra INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await sql(`
        CREATE TABLE IF NOT EXISTS transactions (
          id SERIAL PRIMARY KEY,
          date TEXT NOT NULL,
          description TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await sql(`
        CREATE TABLE IF NOT EXISTS transaction_entries (
          id SERIAL PRIMARY KEY,
          transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
          account_code TEXT NOT NULL REFERENCES chart_of_accounts(code),
          debit REAL DEFAULT 0,
          credit REAL DEFAULT 0,
          CHECK((debit = 0 AND credit > 0) OR (credit = 0 AND debit > 0))
        )
      `);

      await sql(`
        CREATE TABLE IF NOT EXISTS adjusting_entries (
          id SERIAL PRIMARY KEY,
          date TEXT NOT NULL,
          description TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await sql(`
        CREATE TABLE IF NOT EXISTS adjusting_entry_entries (
          id SERIAL PRIMARY KEY,
          adjusting_entry_id INTEGER NOT NULL REFERENCES adjusting_entries(id) ON DELETE CASCADE,
          account_code TEXT NOT NULL REFERENCES chart_of_accounts(code),
          debit REAL DEFAULT 0,
          credit REAL DEFAULT 0,
          CHECK((debit = 0 AND credit > 0) OR (credit = 0 AND debit > 0))
        )
      `);

      await sql(`
        CREATE TABLE IF NOT EXISTS metadata (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create indexes
      await sql(`
        CREATE INDEX IF NOT EXISTS idx_transaction_entries_transaction_id 
        ON transaction_entries(transaction_id)
      `);
      
      await sql(`
        CREATE INDEX IF NOT EXISTS idx_transaction_entries_account_code 
        ON transaction_entries(account_code)
      `);
      
      await sql(`
        CREATE INDEX IF NOT EXISTS idx_adjusting_entry_entries_entry_id 
        ON adjusting_entry_entries(adjusting_entry_id)
      `);
      
      await sql(`
        CREATE INDEX IF NOT EXISTS idx_adjusting_entry_entries_account_code 
        ON adjusting_entry_entries(account_code)
      `);
      
      console.log('✅ Neon schema initialized successfully');
      return;
    } catch (error) {
      // Log all errors, but don't fail if table already exists
      if (error.message && error.message.includes('already exists')) {
        console.log('✅ Neon schema already exists');
      } else {
        console.error('❌ Error creating Neon schema:', error.message || error);
        // Re-throw to let caller know schema init failed
        throw error;
      }
      return;
    }
  }
  
  // Vercel Postgres initialization
  if (!client) {
    await initPostgres();
  }
  
  try {
    const { sql } = client;
    
    // Chart of Accounts table
    await sql`
      CREATE TABLE IF NOT EXISTS chart_of_accounts (
        code TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
        is_contra INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Transactions table
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        date TEXT NOT NULL,
        description TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Transaction entries table
    await sql`
      CREATE TABLE IF NOT EXISTS transaction_entries (
        id SERIAL PRIMARY KEY,
        transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
        account_code TEXT NOT NULL REFERENCES chart_of_accounts(code),
        debit REAL DEFAULT 0,
        credit REAL DEFAULT 0,
        CHECK((debit = 0 AND credit > 0) OR (credit = 0 AND debit > 0))
      )
    `;

    // Adjusting entries table
    await sql`
      CREATE TABLE IF NOT EXISTS adjusting_entries (
        id SERIAL PRIMARY KEY,
        date TEXT NOT NULL,
        description TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Adjusting entry entries table
    await sql`
      CREATE TABLE IF NOT EXISTS adjusting_entry_entries (
        id SERIAL PRIMARY KEY,
        adjusting_entry_id INTEGER NOT NULL REFERENCES adjusting_entries(id) ON DELETE CASCADE,
        account_code TEXT NOT NULL REFERENCES chart_of_accounts(code),
        debit REAL DEFAULT 0,
        credit REAL DEFAULT 0,
        CHECK((debit = 0 AND credit > 0) OR (credit = 0 AND debit > 0))
      )
    `;

    // Metadata table
    await sql`
      CREATE TABLE IF NOT EXISTS metadata (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create indexes
    await sql`
      CREATE INDEX IF NOT EXISTS idx_transaction_entries_transaction_id 
      ON transaction_entries(transaction_id)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_transaction_entries_account_code 
      ON transaction_entries(account_code)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_adjusting_entry_entries_entry_id 
      ON adjusting_entry_entries(adjusting_entry_id)
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_adjusting_entry_entries_account_code 
      ON adjusting_entry_entries(account_code)
    `;
  } catch (error) {
    // Tables might already exist, that's okay
    if (!error.message.includes('already exists')) {
      console.error('Error creating schema:', error);
    }
  }
};

// Get database client
const getClient = async () => {
  if (!initialized) {
    await initPostgres();
  }
  return client;
};

// Wrapper to make Postgres API similar to SQLite
const createPostgresWrapper = () => {
  return {
    prepare: (query) => {
      // Convert SQLite-style ? placeholders to Postgres $1, $2, etc.
      let paramIndex = 1;
      const convertedQuery = query.replace(/\?/g, () => `$${paramIndex++}`);
      
      return {
        run: async (...params) => {
          const client = await getClient();
          const result = await client.sql.query(convertedQuery, params);
          return {
            lastInsertRowid: result.insertId || result.rows?.[0]?.id,
            changes: result.affectedRows || result.rowCount || 0
          };
        },
        get: async (...params) => {
          const client = await getClient();
          const result = await client.sql.query(convertedQuery, params);
          return result.rows?.[0] || null;
        },
        all: async (...params) => {
          const client = await getClient();
          const result = await client.sql.query(convertedQuery, params);
          return result.rows || [];
        },
        exec: async (sql) => {
          const client = await getClient();
          await client.sql.query(sql);
        })
      };
    },
    exec: async (sql) => {
      const client = await getClient();
      // Split multiple statements
      const statements = sql.split(';').filter(s => s.trim());
      for (const statement of statements) {
        if (statement.trim()) {
          await client.sql.query(statement.trim());
        }
      }
    },
    pragma: (setting) => {
      // Postgres doesn't need pragma, just return success
      return { foreign_keys: 'ON' };
    },
    close: async () => {
      if (client) {
        await client.end();
        client = null;
        initialized = false;
      }
    }
  };
};

// Better approach: Direct Postgres methods using @vercel/postgres API
const postgresMethods = {
  async query(sql, params = []) {
    const client = await getClient();
    
    try {
      // @vercel/postgres uses sql.unsafe for dynamic queries
      // Convert ? placeholders to $1, $2, etc. and use parameters
      if (params.length > 0) {
        // Replace ? with $1, $2, etc.
        let paramIndex = 1;
        const convertedSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
        
        // Use unsafe but with proper parameter binding
        const result = await client.sql.unsafe(convertedSql, params);
        return result;
      } else {
        const result = await client.sql.unsafe(sql);
        return result;
      }
    } catch (error) {
      console.error('Postgres query error:', error, 'SQL:', sql.substring(0, 100));
      throw error;
    }
  },
  
  async get(sql, params = []) {
    const result = await this.query(sql, params);
    return result.rows?.[0] || null;
  },
  
  async all(sql, params = []) {
    const result = await this.query(sql, params);
    return result.rows || [];
  },
  
  async run(sql, params = []) {
    // For INSERT queries, append RETURNING id to get the inserted ID
    let modifiedSql = sql;
    if (sql.toUpperCase().includes('INSERT') && !sql.toUpperCase().includes('RETURNING')) {
      // Extract table name and append RETURNING id
      const insertMatch = sql.match(/INSERT INTO\s+(\w+)/i);
      if (insertMatch) {
        modifiedSql = sql + ' RETURNING id';
      }
    }
    
    const result = await this.query(modifiedSql, params);
    
    return {
      lastInsertRowid: result.rows?.[0]?.id || result.insertId,
      changes: result.rowCount || result.affectedRows || 0
    };
  },
  
  async exec(sql) {
    const statements = sql.split(';').filter(s => s.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        await this.query(statement.trim());
      }
    }
  },
  
  pragma: () => ({ foreign_keys: 'ON' })
};

module.exports = {
  getClient,
  initPostgres,
  initializeSchema,
  postgresMethods
};

