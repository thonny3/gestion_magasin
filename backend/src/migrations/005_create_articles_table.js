module.exports = {
	name: '005_create_articles_table',
	up: async (db) => {
		await db.query(`
			CREATE TABLE IF NOT EXISTS articles (
				id INT AUTO_INCREMENT PRIMARY KEY,
				code_article VARCHAR(100) NOT NULL UNIQUE,
				designation VARCHAR(255) NOT NULL,
				description TEXT NULL,
				unite_mesure VARCHAR(50) NOT NULL DEFAULT 'pièce',
				categorie VARCHAR(255) NULL,
				prix_unitaire DECIMAL(15,2) NOT NULL DEFAULT 0,
				stock_minimum INT NOT NULL DEFAULT 0,
				stock_actuel INT NOT NULL DEFAULT 0,
				fournisseur VARCHAR(255) NULL,
				marque VARCHAR(255) NULL,
				reference_fournisseur VARCHAR(255) NULL,
				emplacement VARCHAR(255) NULL,
				date_peremption DATE NULL,
				numero_lot VARCHAR(100) NULL,
				statut ENUM('actif','inactif','discontinue') NOT NULL DEFAULT 'actif',
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
			) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
		`);
	},
	down: async (db) => {
		await db.query('DROP TABLE IF EXISTS articles');
	},
};


