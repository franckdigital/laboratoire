# 🚀 Démarrage Rapide - Frontend Stock ISO 17025

## ✅ Tout est prêt ! Suivez ces étapes :

---

## 📋 Prérequis

Assurez-vous que le backend Django est démarré :

```bash
cd laboratoire-backend
python manage.py runserver
```

✅ Le backend doit être accessible sur `http://localhost:8000`

---

## 🎯 Étape 1 : Démarrer le Frontend

### Option A : Depuis la racine du projet

```bash
cd laboratoire-public
npm run dev
```

### Option B : Si npm run dev ne fonctionne pas

```bash
cd laboratoire-public
npm start
```

### Option C : Avec Vite directement

```bash
cd laboratoire-public
npx vite
```

---

## 🌐 Étape 2 : Accéder à l'Application

1. **Ouvrez votre navigateur**
2. **Accédez à** : http://localhost:5173 (ou le port affiché dans le terminal)
3. **Connectez-vous** avec vos identifiants

---

## 📦 Étape 3 : Accéder au Module Stock

### Dans l'interface :

1. Après connexion, vous verrez le menu latéral gauche
2. Cliquez sur **📦 Stock** (menu déroulant)
3. Le menu se déploie avec 8 options :

```
📦 Stock
  ├─ Articles          → Gestion des articles (page existante)
  ├─ Entrepôts         → 🆕 Nouvelle page
  ├─ Emplacements      → 🆕 Nouvelle page
  ├─ Lots              → 🆕 Nouvelle page
  ├─ Alertes           → 🆕 Nouvelle page
  ├─ Quarantaines      → 🆕 Nouvelle page
  ├─ Transferts        → 🆕 Nouvelle page
  └─ Réceptions        → 🆕 Nouvelle page
```

---

## 🎨 Fonctionnalités Disponibles

### 🏢 Entrepôts (`/app/stock/entrepots`)
- Créer/Modifier/Supprimer des entrepôts
- Gérer les conditions de stockage
- Voir le nombre d'emplacements

### 📍 Emplacements (`/app/stock/emplacements`)
- Créer/Modifier/Supprimer des emplacements
- Filtrer par entrepôt
- Voir le taux d'occupation

### 🏷️ Lots (`/app/stock/lots`)
- Voir tous les lots
- Statistiques en temps réel
- Marquer un lot comme ouvert
- Voir les détails complets

### 🚨 Alertes (`/app/stock/alertes`)
- Voir les alertes actives/traitées
- Filtrer par criticité
- Traiter une alerte avec commentaire

### ⚠️ Quarantaines (`/app/stock/quarantaines`)
- Voir les lots en quarantaine
- Lever une quarantaine
- Accepter/Refuser/Détruire

### 🔄 Transferts (`/app/stock/transferts`)
- Voir les transferts en cours
- Valider un transfert
- Exécuter un transfert

### 📦 Réceptions (`/app/stock/receptions`)
- Voir les réceptions
- Vérifier une réception
- Valider une réception

---

## 🧪 Test Rapide

### 1. Créer un Entrepôt

1. Allez sur **Stock → Entrepôts**
2. Cliquez sur **Nouvel Entrepôt**
3. Remplissez :
   - Code : `ENT-001`
   - Nom : `Entrepôt Principal`
   - Type : `Magasin principal`
4. Cliquez sur **Créer**

### 2. Créer un Emplacement

1. Allez sur **Stock → Emplacements**
2. Cliquez sur **Nouvel Emplacement**
3. Remplissez :
   - Code : `A1-01`
   - Entrepôt : Sélectionnez celui créé
   - Type : `Étagère`
   - Allée : `A`
   - Niveau : `1`
   - Position : `01`
4. Cliquez sur **Créer**

### 3. Voir les Lots

1. Allez sur **Stock → Lots**
2. Vous verrez les statistiques en haut
3. Filtrez par statut si besoin
4. Cliquez sur **Détails** pour voir un lot

### 4. Consulter les Alertes

1. Allez sur **Stock → Alertes**
2. Voyez les alertes par criticité
3. Cliquez sur **Traiter** pour traiter une alerte
4. Ajoutez un commentaire et validez

---

## 🎯 Routes Disponibles

| Page | Route | Description |
|------|-------|-------------|
| Articles | `/app/stock` | Gestion des articles existants |
| Entrepôts | `/app/stock/entrepots` | Gestion des entrepôts |
| Emplacements | `/app/stock/emplacements` | Gestion des emplacements |
| Lots | `/app/stock/lots` | Suivi des lots |
| Alertes | `/app/stock/alertes` | Alertes stock |
| Quarantaines | `/app/stock/quarantaines` | Lots en quarantaine |
| Transferts | `/app/stock/transferts` | Transferts internes |
| Réceptions | `/app/stock/receptions` | Réceptions marchandises |

---

## 🐛 Problèmes Courants

### Le menu Stock n'apparaît pas
**Cause** : Vous n'avez pas la permission `stock.view`  
**Solution** : Connectez-vous avec un compte ayant cette permission (ADMIN ou STAFF)

### "Cannot connect to backend"
**Cause** : Le backend Django n'est pas démarré  
**Solution** : Lancez `python manage.py runserver` dans laboratoire-backend

### Page blanche ou erreur 404
**Cause** : Le frontend n'est pas correctement démarré  
**Solution** : Vérifiez que Vite est bien lancé sur le port 5173

### Les données ne s'affichent pas
**Cause** : Base de données vide  
**Solution** : Créez des données de test via les formulaires

---

## 📊 Vérification

### Checklist de Fonctionnement

- [ ] Backend Django lancé sur http://localhost:8000
- [ ] Frontend React lancé sur http://localhost:5173
- [ ] Connexion réussie avec un compte STAFF/ADMIN
- [ ] Menu **📦 Stock** visible dans la sidebar
- [ ] Sous-menu déroulant fonctionne au clic
- [ ] Pages Entrepôts/Emplacements accessibles
- [ ] Pages Lots/Alertes accessibles
- [ ] Pages Quarantaines/Transferts/Réceptions accessibles
- [ ] Création d'un entrepôt fonctionne
- [ ] Création d'un emplacement fonctionne

---

## 🎨 Captures d'Écran Attendues

### Menu Stock Déroulant
```
📦 Stock ▼
  Articles
  Entrepôts
  Emplacements
  Lots
  Alertes
  Quarantaines
  Transferts
  Réceptions
```

### Page Entrepôts
- Bouton "Nouvel Entrepôt" en haut à droite
- Barre de recherche
- Tableau avec liste des entrepôts
- Colonnes : Code, Nom, Type, Température, Surface, Emplacements, Statut, Actions

### Page Lots
- 4 cartes de statistiques en haut
- Filtres (recherche + statut)
- Tableau détaillé des lots
- Indicateurs visuels (barres de progression, couleurs)

### Page Alertes
- 4 cartes de statistiques par criticité
- Filtres (statut + criticité)
- Cartes d'alertes avec icônes colorées
- Bouton "Traiter" sur les alertes actives

---

## 🔥 Fonctionnalités Avancées

### Recherche et Filtres
- Toutes les pages ont une **recherche en temps réel**
- Les filtres sont **persistants** pendant la session
- Les **statistiques** se mettent à jour automatiquement

### Modals et Notifications
- **Modal** pour créer/modifier
- **AlertModal** pour les confirmations
- **Toast** pour les notifications de succès/erreur

### Traçabilité
- Tous les utilisateurs sont **tracés**
- Toutes les dates sont **horodatées**
- Les commentaires sont **obligatoires** pour actions sensibles

---

## 📞 Aide

### Documentation Complète
- **Frontend** : `FRONTEND_STOCK_ISO17025.md`
- **Backend** : `STOCK_MODULE_UPDATE.md`
- **Général** : `IMPLEMENTATION_COMPLETE.md`

### Commandes Utiles

**Redémarrer le frontend :**
```bash
# Arrêter avec Ctrl+C
# Puis relancer :
npm run dev
```

**Vider le cache :**
```bash
npm run dev -- --force
```

**Voir les logs :**
- Les logs apparaissent dans le terminal où Vite tourne
- Les erreurs API apparaissent dans la console du navigateur (F12)

---

## ✅ Succès !

Si vous voyez :
- ✅ Le menu Stock avec sous-menus
- ✅ Les pages s'affichent correctement
- ✅ Les créations/modifications fonctionnent
- ✅ Les toasts de succès apparaissent

**🎉 Félicitations ! Le frontend est entièrement fonctionnel ! 🎉**

---

**Profitez de votre nouveau système de gestion de stock ISO 17025 ! 🚀📦**
