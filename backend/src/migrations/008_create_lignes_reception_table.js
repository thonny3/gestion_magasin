module.exports = {
	name: '008_create_lignes_reception_table',
	up: async (db) => {
		await db.query(`
			CREATE TABLE IF NOT EXISTS lignes_reception (
				id INT AUTO_INCREMENT PRIMARY KEY,
				bon_reception_id INT NOT NULL,
				article_id INT NOT NULL,
				quantite INT NOT NULL,
				prix_unitaire DECIMAL(15,2) NOT NULL,
				montant DECIMAL(15,2) AS (quantite * prix_unitaire) STORED,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY (bon_reception_id) REFERENCES bons_reception(id) ON DELETE CASCADE,
				FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE RESTRICT
			) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
		`);
	},
	down: async (db) => {
		await db.query('DROP TABLE IF EXISTS lignes_reception');
	},
};


