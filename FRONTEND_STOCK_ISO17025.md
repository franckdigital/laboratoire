# 📦 Frontend Stock ISO 17025 - Documentation

## 🎉 Implémentation Complète

Toutes les fonctionnalités de gestion de stock conforme ISO 17025 ont été implémentées dans le frontend `laboratoire-public`.

---

## ✅ Fonctionnalités Implémentées

### 1. **Service API Étendu** (`src/services/api.ts`)

Le service API a été étendu avec tous les endpoints nécessaires :

#### Entrepôts
- `api.stock.entrepots.list()` - Liste des entrepôts
- `api.stock.entrepots.get(id)` - Détails d'un entrepôt
- `api.stock.entrepots.create(data)` - Créer un entrepôt
- `api.stock.entrepots.update(id, data)` - Modifier un entrepôt
- `api.stock.entrepots.delete(id)` - Supprimer un entrepôt

#### Emplacements
- `api.stock.emplacements.list()` - Liste des emplacements
- `api.stock.emplacements.get(id)` - Détails d'un emplacement
- `api.stock.emplacements.create(data)` - Créer un emplacement
- `api.stock.emplacements.update(id, data)` - Modifier un emplacement
- `api.stock.emplacements.delete(id)` - Supprimer un emplacement
- `api.stock.emplacements.scan(qrCode)` - Scanner un QR code d'emplacement

#### Lots
- `api.stock.lots.list()` - Liste des lots
- `api.stock.lots.get(id)` - Détails d'un lot
- `api.stock.lots.create(data)` - Créer un lot
- `api.stock.lots.update(id, data)` - Modifier un lot
- `api.stock.lots.scan(qrCode)` - Scanner un QR code de lot
- `api.stock.lots.marquerOuvert(id)` - Marquer un lot comme ouvert

#### Alertes
- `api.stock.alertes.list()` - Liste des alertes
- `api.stock.alertes.get(id)` - Détails d'une alerte
- `api.stock.alertes.marquerTraitee(id, commentaire)` - Marquer une alerte comme traitée
- `api.stock.alertes.critiques()` - Alertes critiques uniquement

#### Quarantaines
- `api.stock.quarantaines.list()` - Liste des quarantaines
- `api.stock.quarantaines.get(id)` - Détails d'une quarantaine
- `api.stock.quarantaines.create(data)` - Créer une quarantaine
- `api.stock.quarantaines.lever(id, decision, commentaire)` - Lever une quarantaine

#### Transferts Internes
- `api.stock.transferts.list()` - Liste des transferts
- `api.stock.transferts.get(id)` - Détails d'un transfert
- `api.stock.transferts.create(data)` - Créer un transfert
- `api.stock.transferts.valider(id)` - Valider un transfert
- `api.stock.transferts.executer(id)` - Exécuter un transfert

#### Réceptions
- `api.stock.receptions.list()` - Liste des réceptions
- `api.stock.receptions.get(id)` - Détails d'une réception
- `api.stock.receptions.create(data)` - Créer une réception
- `api.stock.receptions.verifier(id)` - Vérifier une réception
- `api.stock.receptions.valider(id)` - Valider une réception

---

## 📄 Pages Créées

### 1. **EntrepotsPage** (`/app/stock/entrepots`)

**Fonctionnalités :**
- ✅ Liste des entrepôts avec recherche
- ✅ Création d'entrepôts
- ✅ Modification d'entrepôts
- ✅ Suppression d'entrepôts
- ✅ Gestion des conditions de stockage (température, humidité)
- ✅ Suivi du nombre d'emplacements par entrepôt
- ✅ Statut actif/inactif

**Champs gérés :**
- Code, nom, type d'entrepôt
- Température min/max, humidité contrôlée
- Adresse, surface (m²)
- Responsable

---

### 2. **EmplacementsPage** (`/app/stock/emplacements`)

**Fonctionnalités :**
- ✅ Liste des emplacements avec filtre par entrepôt
- ✅ Création d'emplacements
- ✅ Modification d'emplacements
- ✅ Suppression d'emplacements
- ✅ Organisation hiérarchique (allée, niveau, position)
- ✅ Visualisation du taux d'occupation
- ✅ Gestion de la capacité

**Champs gérés :**
- Code, entrepôt, type d'emplacement
- Allée, niveau, position
- Capacité max, unité de capacité
- Température min/max, conditions spéciales

---

### 3. **LotsPage** (`/app/stock/lots`)

**Fonctionnalités :**
- ✅ Liste des lots avec recherche et filtres
- ✅ Statistiques temps réel (actifs, ouverts, péremption proche, expirés)
- ✅ Visualisation de la quantité restante (barre de progression)
- ✅ Indicateur de péremption coloré
- ✅ Action "Marquer comme ouvert"
- ✅ Modal de détails complet
- ✅ Traçabilité complète

**Informations affichées :**
- Numéro de lot, article, quantité
- Dates (fabrication, péremption, ouverture)
- Emplacement, fournisseur
- Statut, certificat d'analyse

---

### 4. **AlertesStockPage** (`/app/stock/alertes`)

**Fonctionnalités :**
- ✅ Liste des alertes avec filtres (statut, criticité)
- ✅ Statistiques par niveau de criticité
- ✅ Affichage visuel par couleur et icône
- ✅ Traitement des alertes avec commentaire
- ✅ Historique de traitement

**Types d'alertes gérés :**
- Péremption proche
- Stock bas
- Quarantaine
- Consommation anormale

**Niveaux de criticité :**
- 🔴 Critique
- 🟠 Élevée
- 🟡 Moyenne
- 🔵 Faible

---

### 5. **QuarantainesPage** (`/app/stock/quarantaines`)

**Fonctionnalités :**
- ✅ Liste des quarantaines avec filtres
- ✅ Statistiques (en cours, acceptées, refusées)
- ✅ Levée de quarantaine avec décision
- ✅ Justification obligatoire
- ✅ Traçabilité complète

**Décisions possibles :**
- ✅ Accepter le lot
- ❌ Refuser le lot
- 🗑️ Destruction requise

---

### 6. **TransfertsPage** (`/app/stock/transferts`)

**Fonctionnalités :**
- ✅ Liste des transferts avec filtres
- ✅ Workflow de validation/exécution
- ✅ Visualisation source → destination
- ✅ Suivi du statut

**Workflow :**
1. **EN_ATTENTE** → Action "Valider"
2. **VALIDE** → Action "Exécuter"
3. **EXECUTE** → Terminé

---

### 7. **ReceptionsPage** (`/app/stock/receptions`)

**Fonctionnalités :**
- ✅ Liste des réceptions avec filtres
- ✅ Statistiques (en attente, vérifiées, validées)
- ✅ Workflow de vérification/validation
- ✅ Lien avec bons de commande

**Workflow :**
1. **EN_ATTENTE** → Action "Vérifier"
2. **VERIFIEE** → Action "Valider"
3. **VALIDEE** → Terminé

---

## 🗺️ Routes Configurées

Toutes les routes ont été ajoutées au router (`src/router.tsx`) :

```typescript
/app/stock                  → StockPage (Articles)
/app/stock/entrepots        → EntrepotsPage
/app/stock/emplacements     → EmplacementsPage
/app/stock/lots             → LotsPage
/app/stock/alertes          → AlertesStockPage
/app/stock/quarantaines     → QuarantainesPage
/app/stock/transferts       → TransfertsPage
/app/stock/receptions       → ReceptionsPage
```

---

## 🧭 Navigation Mise à Jour

Le menu de navigation (`DashboardLayout.tsx`) a été enrichi avec un **menu déroulant Stock** :

```
📦 Stock (Menu déroulant)
  ├─ Articles
  ├─ Entrepôts
  ├─ Emplacements
  ├─ Lots
  ├─ Alertes
  ├─ Quarantaines
  ├─ Transferts
  └─ Réceptions
```

---

## 🎨 Composants UI Utilisés

Toutes les pages utilisent les composants existants :

- **Modal** - Fenêtres modales réutilisables
- **AlertModal** - Confirmations avec types (success, warning, danger, info)
- **Toast** - Notifications temporaires

---

## 🔐 Sécurité et Permissions

Toutes les routes sont protégées par `PermissionGuard` avec la permission `stock.view`.

---

## 📊 Fonctionnalités Clés

### Traçabilité ISO 17025
- ✅ Historique complet de tous les mouvements
- ✅ Signatures électroniques (utilisateurs tracés)
- ✅ Horodatage de toutes les actions
- ✅ Commentaires justificatifs

### Alertes Intelligentes
- ✅ Détection automatique des péremptions proches
- ✅ Surveillance des stocks bas
- ✅ Alertes de consommation anormale
- ✅ Niveaux de criticité adaptés

### Gestion des Lots
- ✅ Traçabilité du fabricant au client
- ✅ Gestion des certificats d'analyse
- ✅ Dates de fabrication/péremption/ouverture
- ✅ Quantités initiales et restantes

### Quarantaines
- ✅ Mise en quarantaine avec motif
- ✅ Workflow de décision (accepter/refuser/détruire)
- ✅ Justifications obligatoires
- ✅ Historique complet

### Organisation Spatiale
- ✅ Hiérarchie entrepôts → emplacements
- ✅ Organisation par allée/niveau/position
- ✅ Contrôle des capacités
- ✅ Conditions de stockage spécifiques

---

## 🚀 Comment Utiliser

### 1. Démarrer le Backend
```bash
cd laboratoire-backend
python manage.py runserver
```

### 2. Démarrer le Frontend
```bash
cd laboratoire-public
npm run dev
```

### 3. Accéder aux Pages
- Connectez-vous avec un compte ayant la permission `stock.view`
- Cliquez sur **📦 Stock** dans le menu
- Accédez aux différentes pages via les sous-menus

---

## 📈 Améliorations Futures

### Court Terme
- [ ] Génération de QR Codes depuis le frontend
- [ ] Scanner de QR codes intégré (WebRTC)
- [ ] Export PDF des rapports
- [ ] Graphiques de consommation

### Moyen Terme
- [ ] Notifications push pour alertes critiques
- [ ] Impression d'étiquettes
- [ ] Import/Export Excel
- [ ] Tableau de bord dédié stock

### Long Terme
- [ ] Application mobile complète (déjà en cours - lab-manager)
- [ ] Intégration avec balances électroniques
- [ ] Reconnaissance vocale pour inventaires
- [ ] IA pour prédiction de consommation

---

## 🐛 Débogage

### Problème : "Permission denied"
**Solution** : Vérifier que l'utilisateur a la permission `stock.view`

### Problème : "Cannot connect to backend"
**Solution** : Vérifier que le backend Django est démarré sur `http://localhost:8000`

### Problème : "404 Not Found"
**Solution** : Vérifier que les migrations Django ont été appliquées

---

## 📞 Support

Pour toute question ou problème :
- **Email** : support@lanema.cm
- **Documentation backend** : `STOCK_MODULE_UPDATE.md`
- **Guide installation** : `INSTALLATION_RAPIDE.md`

---

## ✅ Checklist de Vérification

- [x] Service API étendu avec tous les endpoints
- [x] 7 nouvelles pages créées
- [x] Routes configurées dans le router
- [x] Menu de navigation mis à jour
- [x] Composants Modal, AlertModal, Toast intégrés
- [x] Permissions vérifiées sur toutes les routes
- [x] Filtres et recherches implémentés
- [x] Statistiques temps réel affichées
- [x] Workflows de validation/exécution fonctionnels
- [x] Traçabilité complète assurée

---

**🎊 Félicitations ! Le module de gestion de stock ISO 17025 est entièrement fonctionnel dans le frontend ! 🎊**

**Version** : 2.0.0  
**Date** : 1er Décembre 2025  
**Statut** : ✅ PRODUCTION READY
