async function up(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS ordres_mission (
      id_om INT AUTO_INCREMENT PRIMARY KEY,
      numero_om VARCHAR(50) UNIQUE NOT NULL,
      nom_personne VARCHAR(100) NOT NULL,
      fonction VARCHAR(100) NOT NULL,
      moto_no VARCHAR(20),
      districts_visites TEXT,
      date_depart DATE NOT NULL,
      km_depart INT DEFAULT 0,
      date_arrivee DATE,
      km_arrivee INT DEFAULT 0,
      statut ENUM('en_cours', 'termine', 'annule') DEFAULT 'en_cours',
      observations TEXT,
      utilisateur_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (utilisateur_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  
  console.log('✅ Table ordres_mission créée avec succès');
}

async function down(db) {
  await db.query('DROP TABLE IF EXISTS ordres_mission');
  console.log('✅ Table ordres_mission supprimée');
}

module.exports = {
  name: '014_create_ordres_mission_table',
  up,
  down
};
