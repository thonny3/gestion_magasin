module.exports = {
	name: '004_create_categories_table',
	up: async (db) => {
		await db.query(`
			CREATE TABLE IF NOT EXISTS categories (
				id INT AUTO_INCREMENT PRIMARY KEY,
				nom VARCHAR(255) NOT NULL,
				code VARCHAR(50) NOT NULL UNIQUE,
				description TEXT NULL,
				couleur VARCHAR(16) NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
			) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
		`);
	},
	down: async (db) => {
		await db.query('DROP TABLE IF EXISTS categories');
	},
};


