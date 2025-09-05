# Guide d'Utilisation - Gestion des Articles

## 🚀 Comment Lancer l'Application

### Méthode 1 : Via Command Prompt (Recommandée)
```cmd
# Ouvrir Command Prompt (cmd) et naviguer vers le dossier
cd "C:\Users\Bokolo UN-IT\Desktop\Berthin\stock"

# Lancer l'application
npm run dev
```

### Méthode 2 : Via PowerShell (si configuré)
```powershell
# Activer l'exécution de scripts (une seule fois)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Puis lancer
npm run dev
```

### Méthode 3 : Directement via Node
```cmd
npx vite
```

## 📋 Fonctionnalités Disponibles

### 🆕 **Ajouter un Article**
- Cliquez sur le bouton **"Ajouter Article"** (bleu)
- Remplissez le formulaire complet :
  - ✅ Code article (obligatoire)
  - ✅ Désignation (obligatoire) 
  - ✅ Prix unitaire (obligatoire)
  - ✅ Stock minimum et actuel (obligatoire)
  - Description, catégorie, fournisseur, etc.
- Validation automatique des champs
- Boutons : Ajouter, Réinitialiser, Annuler

### 🏷️ **Gestion des Catégories**
- Cliquez sur le bouton **"Catégories"** (violet)
- Fonctionnalités :
  - ➕ Ajouter nouvelles catégories
  - ✏️ Modifier catégories existantes
  - 🗑️ Supprimer catégories (si vides)
  - 🎨 Choisir couleurs pour chaque catégorie
  - 🔍 Rechercher dans les catégories

### 📤 **Importer des Articles**
- Cliquez sur le bouton **"Importer"** (vert)
- Fonctionnalités :
  - 📥 Télécharger modèle CSV
  - 🖱️ Glisser-déposer ou sélectionner fichier
  - 👀 Aperçu des données avant import
  - ✅ Rapport d'importation avec erreurs/avertissements
  - 📊 Gestion des doublons et erreurs

### 🔍 **Filtrage Avancé**
- Cliquez sur le bouton **"Filtrer"** (gris/orange si actif)
- Critères disponibles :
  - 🏷️ Catégorie
  - 💰 Fourchette de prix (min/max)
  - 📦 Niveau de stock (min/max)
  - ⚠️ Articles en stock faible uniquement
  - 🏢 Fournisseur et marque
  - 📍 Emplacement
  - 📅 Date de création
  - 🔄 Statut (actif/inactif/discontinué)

### 🗑️ **Suppression avec Confirmation**
- Cliquez sur l'icône 🗑️ dans le tableau
- Modal de confirmation sécurisée :
  - ⚠️ Avertissement clair
  - 📝 Affichage du nom de l'article
  - ❌ Confirmation obligatoire
  - 🔒 Protection contre suppression accidentelle

### 🔍 **Recherche et Navigation**
- 🔍 **Recherche instantanée** : Tapez dans la barre de recherche
- 📊 **Statistiques en temps réel** : Total articles, stock faible, valeur totale
- 🏷️ **Badges visuels** : Catégories, statuts, alertes stock
- 📱 **Interface responsive** : Fonctionne sur mobile et desktop

## 🎨 **Interface en Mode Clair**

L'application démarre automatiquement en **mode clair** avec :
- 🌞 Fond blanc partout (sidebar, navbar, contenu)
- 🔤 Texte sombre pour un meilleur contraste
- 🎯 Interface moderne et épurée
- 👁️ Excellente lisibilité

## 📊 **Données de Test**

L'application contient des données de démonstration pour tester :
- 📦 **Articles variés** : Ordinateurs, fournitures, mobilier
- 🏷️ **Catégories prédéfinies** : Équipements, Fournitures, etc.
- ⚠️ **Articles en stock faible** pour tester les alertes
- 💰 **Prix variés** pour tester les filtres de prix

## ⚡ **Actions Rapides**

### Pour tester rapidement :
1. **Ajouter un article** → Bouton bleu "Ajouter Article"
2. **Filtrer par stock faible** → Filtrer → Cocher "Stock faible"
3. **Rechercher** → Tapez "ordinateur" dans la barre de recherche
4. **Importer** → Télécharger le modèle CSV puis l'importer
5. **Gérer catégories** → Bouton violet "Catégories"

## 🔧 **En Cas de Problème**

### Erreur PowerShell :
```cmd
# Utilisez Command Prompt à la place
cmd /c "npm run dev"
```

### Port déjà utilisé :
```cmd
# L'application s'ouvrira automatiquement sur un port libre
# Généralement http://localhost:5173
```

### Modules manquants :
```cmd
npm install
```

## 🎯 **URLs de Navigation**

Une fois l'application lancée, vous pouvez naviguer via :
- `/` - Tableau de bord
- `/articles` - Gestion des articles (avec tous les modaux)
- `/reception` - Bons de réception
- `/sortie` - Bons de sortie
- `/stock` - Mouvements de stock
- `/distribution` - Distributions
- `/paiement` - États de paiement
- `/mission` - Ordres de mission
- `/pv` - PV de réception

Toutes les sections sont accessibles via la sidebar blanche ! 🎉
