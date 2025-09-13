async function up(db) {
  // Créer la table des rôles
  await db.query(`
    CREATE TABLE IF NOT EXISTS user_roles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(50) UNIQUE NOT NULL,
      display_name VARCHAR(100) NOT NULL,
      description TEXT,
      permissions JSON,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // Ajouter la colonne role_id à la table users si elle n'existe pas
  await db.query(`
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS role_id INT,
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS last_login TIMESTAMP NULL,
    ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
    ADD COLUMN IF NOT EXISTS email VARCHAR(255),
    ADD FOREIGN KEY (role_id) REFERENCES user_roles(id) ON DELETE SET NULL
  `);

  // Insérer les rôles par défaut
  await db.query(`
    INSERT INTO user_roles (name, display_name, description, permissions) VALUES
    ('admin', 'Administrateur', 'Accès complet au système', '["all"]'),
    ('manager', 'Gestionnaire', 'Gestion des opérations et rapports', '["read", "write", "manage_users", "view_reports"]'),
    ('operator', 'Opérateur', 'Opérations quotidiennes', '["read", "write"]'),
    ('viewer', 'Consultant', 'Consultation uniquement', '["read"]')
  `);

  console.log('✅ Table user_roles créée avec succès');
  console.log('✅ Colonnes ajoutées à la table users');
  console.log('✅ Rôles par défaut insérés');
}

async function down(db) {
  // Supprimer les colonnes ajoutées à la table users
  await db.query(`
    ALTER TABLE users 
    DROP COLUMN IF EXISTS role_id,
    DROP COLUMN IF EXISTS is_active,
    DROP COLUMN IF EXISTS last_login,
    DROP COLUMN IF EXISTS phone,
    DROP COLUMN IF EXISTS email
  `);

  // Supprimer la table des rôles
  await db.query('DROP TABLE IF EXISTS user_roles');
  
  console.log('✅ Table user_roles supprimée');
  console.log('✅ Colonnes supprimées de la table users');
}

module.exports = {
  name: '016_create_user_roles_table',
  up,
  down
};

