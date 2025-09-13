require('dotenv').config();
const { initializeDatabase, getPool } = require('./db');
const fs = require('fs');
const path = require('path');

async function ensureMigrationsTable(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

async function getAppliedMigrations(pool) {
  const [rows] = await pool.query('SELECT name FROM migrations ORDER BY id ASC');
  return new Set(rows.map((r) => r.name));
}

async function applyMigration(pool, migration) {
  await migration.up(pool);
  await pool.query('INSERT INTO migrations (name) VALUES (?)', [migration.name]);
}

async function runMigrations() {
  await initializeDatabase();
  const pool = getPool();
  await ensureMigrationsTable(pool);

  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.js'))
    .sort();

  const applied = await getAppliedMigrations(pool);

  for (const file of files) {
    const migration = require(path.join(migrationsDir, file));
    if (!applied.has(migration.name)) {
      console.log(`Applying migration: ${migration.name}`);
      await applyMigration(pool, migration);
    }
  }

  console.log('Migrations up to date');
}

if (require.main === module) {
  runMigrations().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}

module.exports = { runMigrations };


