const bcrypt = require('bcrypt');

module.exports = {
  name: '003_seed_default_admin',
  up: async (pool) => {
    const defaultAdminUser = process.env.DEFAULT_ADMIN_USER || 'admin';
    const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';

    const [admins] = await pool.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    if (admins.length === 0) {
      const passwordHash = await bcrypt.hash(defaultAdminPassword, 10);
      const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [defaultAdminUser]);
      if (existing.length === 0) {
        await pool.query('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)', [defaultAdminUser, passwordHash, 'admin']);
        console.log(`Seeded default admin user: ${defaultAdminUser}`);
      }
    }
  },
};


