module.exports = {
	name: '013_create_paiements_table',
	up: async (db) => {
		await db.query(`
			CREATE TABLE IF NOT EXISTS paiements (
				id INT AUTO_INCREMENT PRIMARY KEY,
				numero VARCHAR(50) NOT NULL UNIQUE,
				client VARCHAR(255) NOT NULL,
				date_emission DATE NOT NULL,
				date_echeance DATE NOT NULL,
				montant DECIMAL(15,2) NOT NULL DEFAULT 0,
				montant_paye DECIMAL(15,2) NOT NULL DEFAULT 0,
				statut ENUM('payee','partielle','impayee','en_retard') NOT NULL DEFAULT 'impayee',
				mode_paiement VARCHAR(100) NULL,
				date_paiement DATE NULL,
				observations TEXT NULL,
				categorie VARCHAR(100) NOT NULL DEFAULT 'Services',
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
			) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
		`);
	},
	down: async (db) => {
		await db.query('DROP TABLE IF EXISTS paiements');
	},
};


