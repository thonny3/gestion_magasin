const mysql = require('mysql2/promise');

const {
  DB_HOST = '127.0.0.1',
  DB_PORT = '3306',
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'stock_app',
} = process.env;

let pool;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectWithRetry(config, attempts = 5, delayMs = 1000) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const conn = await mysql.createConnection(config);
      return conn;
    } catch (err) {
      lastError = err;
      const nextDelay = delayMs * attempt;
      console.warn(`MySQL connection attempt ${attempt}/${attempts} failed: ${err.code || err.message}. Retrying in ${nextDelay}ms...`);
      await sleep(nextDelay);
    }
  }
  throw lastError;
}

async function initializeDatabase() {
  const baseConfig = {
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    multipleStatements: true,
  };

  // Connect without DB to ensure it exists
  const connection = await connectWithRetry(baseConfig, 5, 500);

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await connection.end();

  // Create pool with database
  pool = mysql.createPool({
    ...baseConfig,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  // Table and seed creation are handled by migrations

  return pool;
}

function getPool() {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initializeDatabase() first.');
  }
  return pool;
}

module.exports = { initializeDatabase, getPool };


