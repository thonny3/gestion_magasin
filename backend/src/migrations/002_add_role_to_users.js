module.exports = {
  name: '002_add_role_to_users',
  up: async (pool) => {
    // Add role column if not exists
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role ENUM('admin','user') NOT NULL DEFAULT 'user';
    `).catch(async (err) => {
      // MySQL versions before 8.0.29 don't support IF NOT EXISTS for ADD COLUMN
      if (err && err.code === 'ER_PARSE_ERROR') {
        const [cols] = await pool.query("SHOW COLUMNS FROM users LIKE 'role'");
        if (cols.length === 0) {
          await pool.query("ALTER TABLE users ADD COLUMN role ENUM('admin','user') NOT NULL DEFAULT 'user'");
        }
      } else {
        throw err;
      }
    });
  },
};


