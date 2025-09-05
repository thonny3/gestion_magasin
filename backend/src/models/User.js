const { getPool } = require('../db');

async function findByUsername(username) {
  const pool = getPool();
  const [rows] = await pool.query('SELECT id, username, password_hash, role FROM users WHERE username = ?', [username]);
  return rows[0] || null;
}

async function createUser(username, passwordHash, role = 'user') {
  const pool = getPool();
  const [result] = await pool.query('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)', [username, passwordHash, role]);
  return { id: result.insertId, username, role };
}

module.exports = { findByUsername, createUser };


