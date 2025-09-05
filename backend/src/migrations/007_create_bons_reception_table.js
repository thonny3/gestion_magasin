module.exports = {
	name: '007_create_bons_reception_table',
	up: async (db) => {
		await db.query(`
			CREATE TABLE IF NOT EXISTS bons_reception (
				id INT AUTO_INCREMENT PRIMARY KEY,
				numero_bon VARCHAR(50) NOT NULL UNIQUE,
				date_reception DATE NOT NULL,
				district VARCHAR(255) NOT NULL,
				commune VARCHAR(255) NOT NULL,
				fournisseur VARCHAR(255) NOT NULL,
				utilisateur_id INT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
			) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
		`);
	},
	down: async (db) => {
		await db.query('DROP TABLE IF EXISTS bons_reception');
	},
};


