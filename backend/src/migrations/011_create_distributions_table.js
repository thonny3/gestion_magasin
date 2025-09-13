module.exports = {
	name: '011_create_distributions_table',
	up: async (db) => {
		await db.query(`
			CREATE TABLE IF NOT EXISTS distributions (
				id INT AUTO_INCREMENT PRIMARY KEY,
				reference VARCHAR(50) NOT NULL UNIQUE,
				titre VARCHAR(255) NOT NULL,
				description TEXT NULL,
				destination VARCHAR(255) NOT NULL,
				date_planification DATE NOT NULL,
				date_execution DATE NULL,
				statut ENUM('planifie','en_cours','termine','annule') NOT NULL DEFAULT 'planifie',
				priorite ENUM('basse','normale','haute','urgente') NOT NULL DEFAULT 'normale',
				responsable VARCHAR(255) NOT NULL,
				vehicule VARCHAR(255) NULL,
				beneficiaires INT NOT NULL DEFAULT 0,
				observations TEXT NULL,
				coord_lat DECIMAL(10,7) NULL,
				coord_lng DECIMAL(10,7) NULL,
				bon_sortie_id INT NULL,
				derniere_mise_a_jour TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
		`);
	},
	down: async (db) => {
		await db.query('DROP TABLE IF EXISTS distributions');
	},
};



