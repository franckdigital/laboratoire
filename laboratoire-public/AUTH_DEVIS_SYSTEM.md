# 🔐 Système d'Authentification & Demande de Devis - LANEMA

## 📋 Vue d'ensemble

Système complet d'authentification avec gestion de session et module de demande de devis pour les clients du laboratoire LANEMA.

## 🎯 Fonctionnalités implémentées

### 1. **Système d'authentification**
- ✅ Connexion / Déconnexion
- ✅ Inscription nouveau client
- ✅ Gestion de session (localStorage)
- ✅ Protection des routes (ProtectedRoute)
- ✅ Rôles utilisateurs (CLIENT, ADMIN, TECHNICIEN, RESPONSABLE)
- ✅ Redirection automatique après login

### 2. **Demande de devis en ligne**
- ✅ Formulaire en 3 étapes
- ✅ Sélection type d'analyse
- ✅ Gestion des échantillons
- ✅ Upload de documents
- ✅ Confirmation avant envoi

## 📁 Structure des fichiers créés

```
src/
├── contexts/
│   └── AuthContext.tsx                    # Context React pour l'authentification
├── components/
│   └── ProtectedRoute.tsx                 # HOC pour protéger les routes
├── app/
│   ├── routes/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx             # Page de connexion
│   │   │   └── RegisterPage.tsx          # Page d'inscription
│   │   └── client/
│   │       └── DemandeDevisPage.tsx      # Demande de devis (3 steps)
│   └── layouts/
│       └── ClientLayout.tsx              # Layout mis à jour avec user info
├── App.tsx                                # Mis à jour avec AuthProvider
└── router.tsx                             # Routes protégées
```

## 🔄 Workflow d'authentification

```
┌─────────────────────────────────────────────────┐
│  1. Utilisateur visite /client                  │
│     (route protégée)                            │
└─────────────────────────────────────────────────┘
                    ↓
         ┌──────────────────┐
         │ Est authentifié? │
         └──────────────────┘
           ↓NO          ↓YES
    ┌──────────┐    ┌──────────────┐
    │ /login   │    │ Accès client │
    └──────────┘    └──────────────┘
         ↓
    ┌──────────────────────┐
    │ Saisie credentials   │
    │ email + password     │
    └──────────────────────┘
         ↓
    ┌──────────────────────┐
    │ AuthContext.login()  │
    │ - Vérifie identité   │
    │ - Stocke token       │
    │ - Stocke user        │
    └──────────────────────┘
         ↓
    ┌──────────────────────┐
    │ Redirection /client  │
    └──────────────────────┘
```

## 🔑 AuthContext API

### Provider
```typescript
<AuthProvider>
  {/* Votre app */}
</AuthProvider>
```

### Hook useAuth()
```typescript
const { user, login, logout, isAuthenticated, isLoading } = useAuth()

// user: User | null
interface User {
  id: number
  email: string
  raison_sociale: string
  type: 'PREMIUM' | 'STANDARD' | 'OCCASIONNEL'
  role: 'CLIENT' | 'ADMIN' | 'TECHNICIEN' | 'RESPONSABLE'
}

// login: async (email, password) => Promise<void>
await login('client@sococe.ci', 'demo123')

// logout: () => void
logout() // Supprime token et user

// isAuthenticated: boolean
if (isAuthenticated) { /* ... */ }

// isLoading: boolean
if (isLoading) { return <Loader /> }
```

## 🛡️ Protection des routes

### ProtectedRoute Component
```typescript
// Route protégée (tout utilisateur authentifié)
<ProtectedRoute>
  <ClientLayout />
</ProtectedRoute>

// Route protégée avec rôle spécifique
<ProtectedRoute requiredRole="CLIENT">
  <ClientLayout />
</ProtectedRoute>

<ProtectedRoute requiredRole="ADMIN">
  <DashboardLayout />
</ProtectedRoute>
```

### Comportement
- Non authentifié → Redirige vers `/login`
- Authentifié mais mauvais rôle → Redirige vers `/unauthorized`
- Authentifié avec bon rôle → Affiche le composant

## 👤 Comptes de démonstration

| Email | Mot de passe | Rôle | Type | Accès |
|-------|--------------|------|------|-------|
| `client@sococe.ci` | `demo123` | CLIENT | PREMIUM | `/client/*` |
| `admin@lanema.ci` | `demo123` | ADMIN | PREMIUM | `/app/*` |
| `technicien@lanema.ci` | `demo123` | TECHNICIEN | STANDARD | `/app/essais` |

## 📝 Page de connexion (`/login`)

### Caractéristiques
- Design moderne avec gradient
- Validation en temps réel
- Messages d'erreur clairs
- Checkbox "Se souvenir de moi"
- Lien "Mot de passe oublié ?"
- Lien vers inscription
- Affichage comptes démo

### Formulaire
```typescript
interface LoginForm {
  email: string      // Email professionnel
  password: string   // Mot de passe
}
```

### Exemple d'utilisation
```typescript
// LoginPage.tsx
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault()
  try {
    await login(email, password)
    navigate('/client') // Ou route précédente
  } catch (err) {
    setError('Email ou mot de passe incorrect')
  }
}
```

## 📝 Page d'inscription (`/register`)

### Caractéristiques
- Formulaire complet multi-champs
- Validation mot de passe (min 8 caractères)
- Confirmation mot de passe
- Sélection type de client
- Acceptation CGU obligatoire
- Design responsive

### Formulaire
```typescript
interface RegisterForm {
  raison_sociale: string   // Nom entreprise
  email: string           // Email professionnel
  telephone: string       // Téléphone
  adresse: string        // Adresse complète
  type: 'STANDARD' | 'PREMIUM' | 'OCCASIONNEL'
  password: string       // Mot de passe
  confirmPassword: string // Confirmation
}
```

### Validation
- Email valide
- Téléphone au format ivoirien (+225)
- Mot de passe ≥ 8 caractères
- Correspondance password === confirmPassword
- Acceptation CGU

## 📋 Demande de devis (`/client/demande-devis`)

### Étape 1: Informations générales

**Champs:**
- Type d'analyse (8 options avec icônes)
  - ⚙️ Essais mécaniques
  - 🧪 Analyse chimique
  - 📊 Analyse granulométrique
  - 🔬 Essais physiques
  - 🌍 Analyse environnementale
  - 🦠 Analyse microbiologique
  - ✓ Contrôle qualité
  - 📝 Autre

- Catégorie de matériau (dropdown)
  - Ciment, Béton, Granulats, Acier, Eau, Sol, Bitume, etc.

- Priorité (NORMALE / HAUTE / URGENTE)
- Date souhaitée de début
- Description détaillée (textarea)
- Upload documents (PDF, Word, Images)

### Étape 2: Échantillons

**Fonctionnalités:**
- Ajouter/Supprimer échantillons dynamiquement
- Minimum 1 échantillon

**Champs par échantillon:**
- Désignation (requis)
- Quantité (nombre, min 1)
- Unité (unité, kg, L, m, m², m³)
- Description / Observations (optionnel)

### Étape 3: Confirmation

**Affichage:**
- Récapitulatif complet de la demande
- Informations générales
- Liste des échantillons
- Documents joints
- Note d'information (délai 24-48h)

**Actions:**
- Retour (modifier)
- Envoyer la demande (bouton vert)

### Après envoi

**Page de succès:**
- Icône de confirmation ✓
- Message de confirmation
- Information délai de réponse
- Redirection automatique vers `/client/demandes`

## 🎨 Design System

### Couleurs d'état
- **Connexion réussie**: Vert émeraude
- **Erreur**: Rose
- **Info**: Bleu LANEMA
- **Attention**: Ambre

### Composants réutilisés
- Cards avec ombres
- Inputs avec focus ring
- Boutons avec états (loading, disabled)
- Badges de statut
- Stepper (étapes numérotées)

## 🔄 Intégration Backend (À faire)

### Endpoints API requis

```typescript
// Authentification
POST /api/auth/login
{
  "email": "client@sococe.ci",
  "password": "demo123"
}
Response: {
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "client@sococe.ci",
    "raison_sociale": "SOCOCE",
    "type": "PREMIUM",
    "role": "CLIENT"
  }
}

POST /api/auth/register
{
  "raison_sociale": "Mon Entreprise",
  "email": "contact@entreprise.ci",
  "telephone": "+225 XX XX XX XX XX",
  "adresse": "Abidjan, Cocody",
  "type": "STANDARD",
  "password": "motdepasse123"
}
Response: {
  "message": "Compte créé avec succès",
  "user_id": 42
}

POST /api/auth/logout
Headers: { Authorization: "Bearer {token}" }
Response: { "message": "Déconnexion réussie" }

GET /api/auth/me
Headers: { Authorization: "Bearer {token}" }
Response: { "user": {...} }

// Demande de devis
POST /api/client/demandes-devis
Headers: { Authorization: "Bearer {token}" }
FormData: {
  "type_analyse": "MECANIQUE",
  "categorie": "Béton",
  "priorite": "NORMALE",
  "date_souhaitee": "2024-12-15",
  "description": "Description...",
  "echantillons": JSON.stringify([...]),
  "documents": [File, File, ...]
}
Response: {
  "message": "Demande enregistrée",
  "demande_id": "DEV-2024-0123",
  "statut": "EN_ATTENTE"
}

GET /api/client/demandes-devis
Headers: { Authorization: "Bearer {token}" }
Response: {
  "demandes": [...]
}
```

### Mise à jour AuthContext

```typescript
// Remplacer la simulation par de vrais appels API
const login = async (email: string, password: string) => {
  const response = await fetch('http://localhost:8000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  
  if (!response.ok) {
    throw new Error('Email ou mot de passe incorrect')
  }
  
  const data = await response.json()
  localStorage.setItem('lanema_token', data.token)
  localStorage.setItem('lanema_user', JSON.stringify(data.user))
  setUser(data.user)
}
```

## 🔒 Sécurité

### Token JWT
- Stocké dans `localStorage` (clé: `lanema_token`)
- Envoyé dans header: `Authorization: Bearer {token}`
- Expiration après X heures
- Refresh token pour renouvellement

### Données utilisateur
- Stockées dans `localStorage` (clé: `lanema_user`)
- Nettoyées au logout
- Vérifiées au chargement de l'app

### Protection CSRF
- À implémenter avec Django: `csrf_token`
- Envoi dans headers des requêtes POST/PUT/DELETE

### HTTPS obligatoire en production
```
https://lanema.ci
```

## 📊 Flux complet: Demande de devis

```
1. CLIENT SE CONNECTE
   /login → AuthContext.login() → /client
   ↓
2. ACCÈDE AU DASHBOARD
   /client → Clic "Demander un devis"
   ↓
3. FORMULAIRE ÉTAPE 1
   /client/demande-devis
   - Type analyse: Essais mécaniques
   - Catégorie: Béton
   - Priorité: HAUTE
   - Description: "Contrôle qualité chantier X"
   - Upload: cahier_charges.pdf
   Clic "Suivant →"
   ↓
4. FORMULAIRE ÉTAPE 2
   - Échantillon 1: "Béton frais", 3 unités
   - Échantillon 2: "Acier HA12", 5 unités
   Clic "Suivant →"
   ↓
5. CONFIRMATION ÉTAPE 3
   Récapitulatif complet
   Clic "Envoyer la demande"
   ↓
6. API CALL
   POST /api/client/demandes-devis
   Headers: Bearer {token}
   FormData: {...}
   ↓
7. SUCCÈS
   Page confirmation
   Attendre 3s
   ↓
8. REDIRECTION
   /client/demandes
   Demande visible avec statut "EN_ATTENTE"
```

## 🎯 Points d'accès

### Routes publiques
- `/` - Homepage
- `/login` - Connexion
- `/register` - Inscription

### Routes CLIENT (authentification requise)
- `/client` - Dashboard client
- `/client/demandes` - Liste demandes
- `/client/demande-devis` - **Nouveau devis** ⭐
- `/client/echantillons` - Échantillons
- `/client/resultats` - Résultats
- `/client/factures` - Factures

### Routes ADMIN (rôle ADMIN requis)
- `/app` - Dashboard admin
- `/app/clients` - Gestion clients
- `/app/essais` - Gestion essais
- etc.

## 📱 Responsive Design

Toutes les pages d'authentification et de demande de devis sont **100% responsive**:
- Mobile: < 768px (formulaire 1 colonne)
- Tablet: 768px - 1024px (formulaire 2 colonnes)
- Desktop: > 1024px (layout complet)

## 🔔 Notifications (Future)

Après envoi de devis:
- Email automatique au client
- Notification dans `/client/notifications`
- SMS si urgence (optionnel)

## 📈 Statistiques (Future)

Tracking:
- Nombre de demandes de devis par jour
- Taux de conversion devis → commande
- Temps moyen de réponse
- Types d'analyses les plus demandés

## 🚀 Pour tester en local

```bash
# 1. Lancer le serveur
npm run dev

# 2. Visiter l'application
http://localhost:5173

# 3. Se connecter
Email: client@sococe.ci
Password: demo123

# 4. Accéder au dashboard client
/client

# 5. Cliquer "Demander un devis"
/client/demande-devis

# 6. Remplir le formulaire (3 étapes)
# 7. Envoyer la demande
# 8. Voir la confirmation
```

## ✅ Checklist d'implémentation

### Authentification
- [x] Context AuthContext
- [x] ProtectedRoute HOC
- [x] LoginPage
- [x] RegisterPage
- [x] Gestion session localStorage
- [x] Logout functionality
- [x] Protection routes client
- [x] Protection routes admin
- [ ] Intégration API backend
- [ ] Refresh token
- [ ] Mot de passe oublié
- [ ] Vérification email

### Demande de devis
- [x] Page DemandeDevisPage
- [x] Formulaire 3 étapes
- [x] Stepper visuel
- [x] Sélection type analyse
- [x] Gestion échantillons dynamique
- [x] Upload documents
- [x] Validation formulaire
- [x] Page de confirmation
- [x] Redirection après succès
- [ ] Intégration API backend
- [ ] Sauvegarde brouillon
- [ ] Preview documents
- [ ] Estimation prix automatique

## 🎓 Documentation utilisateur

### Pour les clients

**Comment demander un devis ?**

1. Connectez-vous sur https://lanema.ci/login
2. Cliquez sur "Demander un devis" dans le dashboard
3. Remplissez les 3 étapes:
   - Informations générales
   - Détails des échantillons
   - Confirmation
4. Validez votre demande
5. Vous recevrez un email de confirmation
6. Un devis vous sera envoyé sous 24-48h

**Suivi de ma demande**

Accédez à "Mes demandes" pour:
- Voir le statut
- Télécharger le devis reçu
- Accepter/Refuser le devis
- Voir l'historique

---

**Développé pour**: LANEMA  
**Date**: Novembre 2024  
**Version**: 1.0.0  
**Statut**: ✅ Système complet - Prêt pour intégration backend
