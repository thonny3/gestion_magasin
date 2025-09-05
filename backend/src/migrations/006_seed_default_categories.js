module.exports = {
	name: '006_seed_default_categories',
	up: async (pool) => {
		const defaults = [
			{ nom: 'Équipements', code: 'EQU', description: 'Équipements et outillages', couleur: '#3B82F6' },
			{ nom: 'Fournitures', code: 'FOU', description: 'Fournitures de bureau et consommables', couleur: '#10B981' },
			{ nom: 'Mobilier', code: 'MOB', description: 'Mobilier de bureau et rangement', couleur: '#F59E0B' },
			{ nom: 'Outils', code: 'OUT', description: 'Outils et matériel technique', couleur: '#EF4444' },
			{ nom: 'Services', code: 'SRV', description: 'Prestations externes', couleur: '#8B5CF6' },
		];

		for (const cat of defaults) {
			const [rows] = await pool.query('SELECT id FROM categories WHERE code = ? LIMIT 1', [cat.code]);
			if (rows.length === 0) {
				await pool.query('INSERT INTO categories (nom, code, description, couleur) VALUES (?, ?, ?, ?)', [cat.nom, cat.code, cat.description, cat.couleur]);
			}
		}
	},
};


