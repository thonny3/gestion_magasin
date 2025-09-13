module.exports = {
  name: '017_add_pdf_columns',
  up: async (db) => {
    try {
      await db.query(`
        ALTER TABLE bons_reception
        ADD COLUMN IF NOT EXISTS pdf_path VARCHAR(255) NULL
      `);
    } catch {}
    try {
      await db.query(`
        ALTER TABLE bons_sortie
        ADD COLUMN IF NOT EXISTS pdf_path VARCHAR(255) NULL
      `);
    } catch {}
  },
};


