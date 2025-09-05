# StockManager Pro - Gestion de Stock

Application de gestion de stock moderne construite avec React, TypeScript et Tailwind CSS.

## 🚀 Fonctionnalités

- **Gestion des Articles** : Suivi des stocks, prix et informations des articles
- **Bons de Réception** : Gestion des entrées de stock
- **Bons de Sortie** : Gestion des sorties de stock
- **Mouvements de Stock** : Suivi des transactions
- **Distributions** : Gestion des distributions
- **États de Paiement** : Suivi des paiements
- **Ordres de Mission** : Gestion des missions
- **PV de Réception** : Procès-verbaux de réception

## 🏗️ Architecture

### Structure des Routes

L'application utilise React Router pour une navigation moderne et organisée :

```
/                           → Tableau de bord
/articles                   → Gestion des articles
/reception                  → Bons de réception
/sortie                     → Bons de sortie
/distribution               → Gestion des distributions
/stock                      → Mouvements de stock
/paiement                   → États de paiement
/mission                    → Ordres de mission
/pv                         → PV de réception
```

### Organisation des Composants

```
src/
├── components/
│   ├── layout/             # Composants de mise en page
│   │   ├── Layout.tsx      # Layout principal avec sidebar et header
│   │   ├── Sidebar.tsx     # Navigation latérale
│   │   ├── Header.tsx      # En-tête avec thème et utilisateur
│   │   ├── Breadcrumb.tsx  # Navigation breadcrumb
│   │   ├── TabNavigation.tsx # Navigation par onglets
│   │   ├── QuickNavigation.tsx # Navigation rapide
│   │   └── NotFound.tsx    # Page 404
│   ├── dashboard/          # Composants du tableau de bord
│   ├── articles/           # Gestion des articles
│   ├── reception/          # Bons de réception
│   ├── sortie/             # Bons de sortie
│   ├── distribution/       # Gestion des distributions
│   ├── stock/              # Mouvements de stock
│   ├── paiement/           # États de paiement
│   ├── mission/            # Ordres de mission
│   └── pv/                 # PV de réception
├── routes/                 # Configuration des routes
├── config/                 # Configuration de l'application
├── types/                  # Types TypeScript
├── utils/                  # Utilitaires
└── data/                   # Données mockées
```

## 🛠️ Technologies Utilisées

- **React 18** : Bibliothèque UI moderne
- **TypeScript** : Typage statique
- **React Router 6** : Routage côté client
- **Tailwind CSS** : Framework CSS utilitaire
- **Lucide React** : Icônes modernes
- **Vite** : Build tool rapide

## 📦 Installation

1. **Cloner le projet**
   ```bash
   git clone <repository-url>
   cd stock
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Lancer en mode développement**
   ```bash
   npm run dev
   ```

4. **Construire pour la production**
   ```bash
   npm run build
   ```

## 🔧 Configuration

### Variables d'Environnement

Créez un fichier `.env.local` à la racine du projet :

```env
VITE_APP_TITLE=StockManager Pro
VITE_API_URL=http://localhost:3000/api
```

### Personnalisation des Routes

Modifiez `src/config/routes.tsx` pour ajouter ou modifier des routes :

```typescript
export const routeConfig: RouteObject[] = [
  {
    path: '/nouvelle-route',
    element: <NouveauComposant />,
  },
  // ... autres routes
];
```

## 🎨 Thèmes

L'application supporte les thèmes clair et sombre avec un toggle dans le header.

## 📱 Responsive Design

L'interface s'adapte automatiquement aux différentes tailles d'écran :
- **Mobile** : Navigation par menu hamburger
- **Tablet** : Sidebar compacte
- **Desktop** : Sidebar complète

## 🚀 Déploiement

### Vercel
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Déployer le dossier dist/
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème, veuillez ouvrir une issue sur GitHub.
