async function up(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS pv_reception (
      id_pv INT AUTO_INCREMENT PRIMARY KEY,
      numero_pv VARCHAR(50) UNIQUE NOT NULL,
      id_bon_reception INT,
      date_pv DATE NOT NULL,
      adresse VARCHAR(255) NOT NULL,
      fournisseur VARCHAR(255) NOT NULL,
      livreur VARCHAR(255),
      telephone_livreur VARCHAR(20),
      details_articles TEXT,
      observations TEXT,
      statut ENUM('draft', 'finalise') DEFAULT 'draft',
      utilisateur_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (id_bon_reception) REFERENCES bons_reception(id) ON DELETE SET NULL,
      FOREIGN KEY (utilisateur_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  
  console.log('✅ Table pv_reception créée avec succès');
}

async function down(db) {
  await db.query('DROP TABLE IF EXISTS pv_reception');
  console.log('✅ Table pv_reception supprimée');
}

module.exports = {
  name: '015_create_pv_reception_table',
  up,
  down
};

