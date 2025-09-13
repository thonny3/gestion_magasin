const { getPool } = require('../db');

async function listMovements(req, res) {
  try {
    const pool = getPool();

    // Entrées depuis lignes_reception
    const [entries] = await pool.query(`
      SELECT lr.id AS id_ligne,
             lr.article_id,
             lr.quantite,
             lr.prix_unitaire,
             br.date_reception AS date_mvt,
             br.numero_bon,
             br.fournisseur,
             a.code_article,
             a.designation,
             a.unite_mesure,
             a.prix_unitaire AS article_prix,
             a.stock_actuel
      FROM lignes_reception lr
      JOIN bons_reception br ON br.id = lr.bon_reception_id
      JOIN articles a ON a.id = lr.article_id
      ORDER BY lr.id DESC
    `);

    // Sorties depuis lignes_sortie
    const [exits] = await pool.query(`
      SELECT ls.id AS id_ligne,
             ls.article_id,
             ls.quantite,
             ls.prix_unitaire,
             bs.date_sortie AS date_mvt,
             bs.numero_bon,
             bs.destinataire,
             a.code_article,
             a.designation,
             a.unite_mesure,
             a.prix_unitaire AS article_prix,
             a.stock_actuel
      FROM lignes_sortie ls
      JOIN bons_sortie bs ON bs.id = ls.bon_sortie_id
      JOIN articles a ON a.id = ls.article_id
      ORDER BY ls.id DESC
    `);

    const mapEntry = (r) => ({
      id_fiche_stock: `R-${r.id_ligne}`,
      id_article: r.article_id,
      date_mouvement: r.date_mvt,
      type_mouvement: 'entrée',
      quantite: Number(r.quantite),
      reste: Number(r.stock_actuel || 0),
      demandeur: `${r.numero_bon} - ${r.fournisseur}`,
      observation: `Réception de ${r.fournisseur}`,
      valeur: Number(r.quantite) * Number(r.prix_unitaire || r.article_prix || 0),
      article: {
        id_article: r.article_id,
        code_article: r.code_article,
        designation: r.designation,
        unite: r.unite_mesure,
        prix_unitaire: Number(r.article_prix || 0),
        stock_actuel: Number(r.stock_actuel || 0),
      }
    });

    const mapExit = (r) => ({
      id_fiche_stock: `S-${r.id_ligne}`,
      id_article: r.article_id,
      date_mouvement: r.date_mvt,
      type_mouvement: 'sortie',
      quantite: Number(r.quantite),
      reste: Number(r.stock_actuel || 0),
      demandeur: `${r.numero_bon} - ${r.destinataire}`,
      observation: `Sortie vers ${r.destinataire}`,
      valeur: Number(r.quantite) * Number(r.prix_unitaire || r.article_prix || 0),
      article: {
        id_article: r.article_id,
        code_article: r.code_article,
        designation: r.designation,
        unite: r.unite_mesure,
        prix_unitaire: Number(r.article_prix || 0),
        stock_actuel: Number(r.stock_actuel || 0),
      }
    });

    const items = [...entries.map(mapEntry), ...exits.map(mapExit)]
      .sort((a, b) => new Date(b.date_mouvement) - new Date(a.date_mouvement));

    return res.json({ items });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to fetch stock movements', error: e.message });
  }
}

module.exports = { listMovements };


