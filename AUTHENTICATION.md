# Système d'Authentification

## Vue d'ensemble

Le système d'authentification a été intégré dans l'application de gestion de stock pour sécuriser l'accès aux fonctionnalités.

## Fonctionnalités

### 🔐 Authentification
- Page de connexion moderne et responsive
- Validation des identifiants
- Persistance de session (localStorage)
- Protection automatique des routes
- Redirection intelligente (connecté → dashboard, non connecté → login)

### 👤 Gestion des utilisateurs
- Affichage des informations utilisateur dans le header
- Bouton de déconnexion
- Rôles utilisateur (admin/user)

### 🛡️ Sécurité
- Redirection automatique vers la page de connexion si non connecté
- Redirection automatique vers le dashboard si déjà connecté
- Protection de toutes les routes de l'application
- Gestion des états de chargement

## Identifiants de test

### Administrateur
- **Nom d'utilisateur:** `admin`
- **Mot de passe:** `admin123`
- **Rôle:** Administrateur

### Utilisateur standard
- **Nom d'utilisateur:** `user`
- **Mot de passe:** `user123`
- **Rôle:** Utilisateur

## Structure des fichiers

```
src/
├── contexts/
│   └── AuthContext.tsx          # Contexte d'authentification
├── components/
│   ├── auth/
│   │   ├── LoginPage.tsx        # Page de connexion
│   │   ├── ProtectedRoute.tsx   # Protection des routes privées
│   │   └── PublicRoute.tsx      # Protection des routes publiques
│   └── ui/
│       └── LoadingSpinner.tsx   # Composant de chargement
└── types/
    └── routes.ts                # Types et constantes des routes
```

## Utilisation

### Connexion
1. Accédez à l'application
2. Vous serez automatiquement redirigé vers `/login` si non connecté
3. Entrez vos identifiants
4. Cliquez sur "Se connecter"
5. Vous serez redirigé vers la page que vous tentiez d'atteindre ou le dashboard

### Comportement des redirections
- **Non connecté** → Toute route protégée redirige vers `/login`
- **Connecté** → Tentative d'accès à `/login` redirige vers `/`
- **Déconnexion** → Redirige vers `/login`

### Déconnexion
1. Cliquez sur l'icône de déconnexion dans le header
2. Vous serez redirigé vers la page de connexion

## Personnalisation

### Ajouter de nouveaux utilisateurs
Modifiez la fonction `login` dans `AuthContext.tsx` :

```typescript
if (username === 'nouveau' && password === 'motdepasse') {
  const userData: User = {
    id: '3',
    username: 'nouveau',
    email: 'nouveau@example.com',
    role: 'user'
  };
  // ... reste du code
}
```

### Intégration avec une API
Remplacez la logique de connexion dans `AuthContext.tsx` par des appels API réels :

```typescript
const response = await fetch('/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
});

if (response.ok) {
  const userData = await response.json();
  setUser(userData);
  localStorage.setItem('user', JSON.stringify(userData));
  return true;
}
```

## Sécurité

⚠️ **Important:** Ce système utilise le localStorage pour la persistance. En production, considérez :
- L'utilisation de tokens JWT avec expiration
- Le chiffrement des données sensibles
- L'implémentation de refresh tokens
- La validation côté serveur

## Support

Pour toute question ou problème lié à l'authentification, consultez la documentation ou contactez l'équipe de développement.
