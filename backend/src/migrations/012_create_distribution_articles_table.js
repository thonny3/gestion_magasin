module.exports = {
	name: '012_create_distribution_articles_table',
	up: async (db) => {
		await db.query(`
			CREATE TABLE IF NOT EXISTS distribution_articles (
				id INT AUTO_INCREMENT PRIMARY KEY,
				distribution_id INT NOT NULL,
				article_id INT NOT NULL,
				quantite INT NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY (distribution_id) REFERENCES distributions(id) ON DELETE CASCADE,
				FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE RESTRICT
			) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
		`);
	},
	down: async (db) => {
		await db.query('DROP TABLE IF EXISTS distribution_articles');
	},
};



