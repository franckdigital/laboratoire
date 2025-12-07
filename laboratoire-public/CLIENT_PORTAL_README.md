# 👥 Portail Client LANEMA - Documentation

## 📋 Vue d'ensemble

Le **Portail Client** est une interface dédiée permettant aux clients du laboratoire LANEMA de suivre leurs demandes, échantillons, résultats et factures en temps réel.

## 🎯 Objectif

Offrir une expérience client transparente et autonome pour:
- Suivre l'état d'avancement des analyses
- Consulter et télécharger les rapports d'essais
- Gérer les paiements et factures
- Tracer les échantillons avec QR codes

## 🚀 Accès au portail

### URL d'accès
- **Production**: `https://lanema.ci/client`
- **Développement**: `http://localhost:5173/client`

### Workflow utilisateur
```
1. Client visite Homepage (/)
2. Clic sur "Accéder au portail"
3. Redirection vers /client (espace client)
4. Navigation entre les modules clients
```

## 📁 Structure des fichiers créés

```
src/
├── app/
│   ├── layouts/
│   │   └── ClientLayout.tsx          # Layout principal avec header + navigation tabs
│   └── routes/
│       └── client/
│           ├── ClientDashboard.tsx          # Tableau de bord client
│           ├── ClientDemandesPage.tsx       # Gestion des demandes
│           ├── ClientEchantillonsPage.tsx   # Traçabilité échantillons
│           ├── ClientResultatsPage.tsx      # Consultation résultats
│           └── ClientFacturesPage.tsx       # Facturation et paiements
└── router.tsx                        # Routes mises à jour
```

## 🗺️ Routes disponibles

| Route | Page | Description |
|-------|------|-------------|
| `/client` | ClientDashboard | Vue d'ensemble de l'activité |
| `/client/demandes` | ClientDemandesPage | Mes demandes d'analyse |
| `/client/echantillons` | ClientEchantillonsPage | Mes échantillons |
| `/client/resultats` | ClientResultatsPage | Mes résultats d'essais |
| `/client/factures` | ClientFacturesPage | Mes factures et paiements |

## 📊 Modules implémentés

### 1. **ClientDashboard** (`/client`)

**Vue d'ensemble complète:**
- 4 KPIs principaux:
  - Échantillons ce mois (128) +12%
  - Essais planifiés (54)
  - Non-conformités ouvertes (7)
  - Taux de conformité (98.2%)

- **Activité récente** (5 dernières actions):
  - 🧪 Nouvel échantillon reçu
  - ✅ Essai terminé
  - ⚠️ Non-conformité détectée
  - 📄 Rapport validé
  - 🔧 Étalonnage effectué

- **Actions rapides**:
  - Enregistrer un échantillon
  - Planifier un essai
  - Générer un rapport
  - Ajouter un client

- **Alertes & Notifications**:
  - Étalonnage requis
  - Délai dépassé
  - Stock faible

### 2. **ClientDemandesPage** (`/client/demandes`)

**Gestion des demandes d'analyse:**
- Liste de toutes les demandes
- Filtres: Toutes / En cours / Terminées
- Informations par demande:
  - Numéro (DA-YYYYMMDD-XXXX)
  - Type d'essai
  - Nombre d'échantillons
  - Statut: EN_ATTENTE / EN_COURS / TERMINEE
  - Dates: demande, échéance
  - Priorité: URGENTE / HAUTE / NORMALE / BASSE
  - Barre de progression (0-100%)

**Actions:**
- Voir détails
- Télécharger rapport (si terminée)
- Créer nouvelle demande

**Stats:**
- Total demandes
- En cours
- Terminées
- Total échantillons

### 3. **ClientEchantillonsPage** (`/client/echantillons`)

**Traçabilité complète:**
- Affichage en grille (2 colonnes)
- Code unique: ECH-YYYYMMDD-XXXX
- Informations:
  - Désignation
  - Demande liée
  - Statut: RECEPTIONNE / EN_ANALYSE / TERMINE / ARCHIVE
  - Date de réception
  - Localisation physique
  - QR Code

**Actions:**
- Scanner QR Code
- Voir QR Code
- Voir historique
- Détails échantillon

**Stats:**
- Total échantillons
- En analyse
- Terminés
- Archivés

### 4. **ClientResultatsPage** (`/client/resultats`)

**Consultation des résultats:**
- Rapports d'essais validés
- Informations par rapport:
  - Numéro (RAP-YYYY-XXXX)
  - Échantillon lié
  - Type d'essai
  - Valeur mesurée
  - Norme appliquée (NF EN, etc.)
  - Statut: CONFORME / NON_CONFORME
  - Date de validation
  - Valideur (Dr./Ing.)
  - PDF disponible

**Filtres:**
- Tous
- Conformes
- Non-conformes

**Actions:**
- Voir détails
- Télécharger PDF
- Télécharger tout (ZIP)

**Stats:**
- Total rapports
- Conformes
- Non-conformes
- Taux de conformité (%)

### 5. **ClientFacturesPage** (`/client/factures`)

**Gestion financière:**
- Liste des factures
- Informations:
  - Numéro (FACT-YYYY-XXXX)
  - Dates: émission, échéance
  - Montants: HT, TTC (XAF)
  - Statut: PAYEE / EN_ATTENTE / RETARD
  - Date de paiement (si payée)
  - Demandes liées

**Filtres:**
- Toutes
- En attente
- Payées

**Actions:**
- Payer maintenant (si en attente)
- Télécharger PDF
- Voir détails

**Stats:**
- Total factures
- Montant dû
- Payées
- En retard

**Alertes:**
- Paiement en retard (badge rose)
- Payée (badge vert)

## 🎨 Design System Client

### Couleurs spécifiques
- **Primaire**: Bleu LANEMA (#0084e0)
- **Succès**: Vert émeraude (conformité, paiements)
- **Attention**: Ambre (alertes, retards)
- **Erreur**: Rose (non-conformité, pannes)
- **Neutre**: Slate (textes, arrière-plans)

### Composants réutilisés
- Cards (`.lanema-card`)
- Badges de statut
- Barres de progression
- Grilles responsive
- Filtres par onglets

## 🔄 Workflow complet client

```
1. CLIENT VISITE HOMEPAGE
   ↓
2. CLIC "Accéder au portail"
   ↓
3. REDIRECTION /client (Dashboard)
   ↓
4. VUE D'ENSEMBLE
   - KPIs
   - Activité récente
   - Actions rapides
   - Alertes
   ↓
5. NAVIGATION MODULES
   ├─ Demandes: Suivre l'état
   ├─ Échantillons: Traçabilité QR
   ├─ Résultats: Télécharger rapports
   └─ Factures: Gérer paiements
```

## 👤 Profil client actuel (démo)

**Entreprise**: SOCOCE  
**Type**: Client Premium  
**Activité ce mois**:
- 128 échantillons
- 54 essais planifiés
- 7 non-conformités
- 98.2% taux conformité

## 🔐 Authentification (à implémenter)

### Future implémentation
```typescript
// Route protégée
<Route path="/client" element={<ProtectedRoute><ClientLayout /></ProtectedRoute>}>

// Login page
POST /api/auth/login
{
  "email": "contact@sococe.ci",
  "password": "****"
}

// Response
{
  "token": "eyJhbGc...",
  "client": {
    "id": 1,
    "raison_sociale": "SOCOCE",
    "type": "PREMIUM"
  }
}
```

### Rôles clients
- **CLIENT_PREMIUM**: Accès complet + support prioritaire
- **CLIENT_STANDARD**: Accès standard
- **CLIENT_OCCASIONNEL**: Accès limité

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px (navigation collapse)
- **Tablet**: 768px - 1024px (grille 2 colonnes)
- **Desktop**: > 1024px (grille 3-4 colonnes)

### Adaptations mobiles
- Header condensé
- Tabs scrollables
- Cards en liste (1 colonne)
- Actions en menu dropdown

## 🔔 Notifications temps réel

### Types de notifications client
- 📋 Nouvelle demande enregistrée
- 🧪 Échantillon reçu au laboratoire
- ⏳ Essai démarré
- ✅ Résultats disponibles
- ⚠️ Non-conformité détectée
- 💰 Facture émise
- ✓ Paiement confirmé
- 📄 Rapport prêt à télécharger

### Implémentation future (WebSocket)
```typescript
// Connection WebSocket
const ws = new WebSocket('wss://api.lanema.ci/ws/client/1')

ws.onmessage = (event) => {
  const notification = JSON.parse(event.data)
  // Afficher toast notification
  toast.success(notification.message)
}
```

## 📊 Statistiques & Analytics

### Métriques suivies
- Nombre de connexions
- Pages les plus visitées
- Taux de téléchargement PDF
- Temps moyen par session
- Demandes créées via portail
- Paiements en ligne

## 🚀 Prochaines fonctionnalités

### Phase 2
- [ ] Authentification JWT
- [ ] Création demande en ligne
- [ ] Upload documents (cahier des charges)
- [ ] Paiement en ligne (Mobile Money, Carte)
- [ ] Chat avec support technique
- [ ] Historique complet client

### Phase 3
- [ ] Notifications push (email, SMS)
- [ ] Dashboard personnalisable
- [ ] Export données (Excel, CSV)
- [ ] API client pour intégrations
- [ ] Rapports comparatifs
- [ ] Alertes personnalisées

## 🔗 Intégration Backend

### Endpoints API nécessaires
```
GET    /api/client/dashboard          # Stats dashboard
GET    /api/client/demandes            # Liste demandes
POST   /api/client/demandes            # Créer demande
GET    /api/client/echantillons        # Liste échantillons
GET    /api/client/echantillons/:id/qr # QR Code
GET    /api/client/resultats           # Liste résultats
GET    /api/client/resultats/:id/pdf   # Télécharger PDF
GET    /api/client/factures            # Liste factures
POST   /api/client/factures/:id/pay    # Payer facture
GET    /api/client/notifications       # Notifications
```

## 📝 Données de démonstration

Toutes les pages contiennent des données réalistes pour SOCOCE:
- Demandes d'analyse de matériaux BTP
- Échantillons de ciment, béton, granulats
- Résultats avec normes NF EN
- Factures en XAF (Franc CFA)
- Statuts variés et progressions réalistes

## 🎯 Objectifs UX

1. **Simplicité**: Navigation intuitive en 3 clics max
2. **Transparence**: Traçabilité complète de A à Z
3. **Autonomie**: Client gère ses données sans contact
4. **Rapidité**: Chargement < 2s, actions instantanées
5. **Fiabilité**: Données en temps réel synchronisées

## 📞 Support

**Pour les clients:**
- Email: support@lanema.ci
- Tel: +225 XX XX XX XX XX
- Chat en ligne (à venir)

**Documentation technique:**
- Voir `IMPLEMENTATION_COMPLETE.md` pour le dashboard admin
- Voir `README-DASHBOARD.md` pour l'architecture globale

---

**Développé pour**: LANEMA (Laboratoire National d'Essais de Qualité, de Métrologie et d'Analyses)  
**Date**: Novembre 2024  
**Version**: 1.0.0  
**Statut**: ✅ Interface client complète - Prêt pour intégration backend
