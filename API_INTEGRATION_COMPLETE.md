# 🚀 INTÉGRATION COMPLÈTE FRONTEND/BACKEND - GUIDE DÉTAILLÉ

**Date**: 29 Novembre 2024  
**Version**: 2.0.0  
**Status**: 🔄 En cours d'implémentation

---

## 📊 ÉTAT GLOBAL DU PROJET

### ✅ Service API (`src/services/api.ts`)
**Status**: **100% COMPLET**

Le service API centralisé inclut tous les endpoints nécessaires:

```typescript
api.auth          // Authentification
api.devis         // Demandes de devis
api.demandes      // Demandes (admin)
api.echantillons  // Échantillons
api.essais        // Essais/résultats
api.factures      // Factures
api.stock         // Stock
api.metrologie    // Métrologie
api.qualite       // Qualité
api.reporting     // Reporting
api.notifications // Notifications
api.clientsAdmin  // Clients (admin)
api.dashboard     // Dashboard global
```

---

## 🎯 PAGES CLIENT - STATUT

| Page | API | Loading | Formulaires | Tableaux | Stats | Status |
|------|-----|---------|-------------|----------|-------|--------|
| **ClientDashboard** | ✅ | ✅ | N/A | N/A | ✅ | ✅ **100%** |
| **ClientDemandesPage** | ✅ | ✅ | N/A | ✅ | ✅ | ✅ **100%** |
| **ClientEchantillonsPage** | ✅ | ✅ | N/A | ✅ | ✅ | ✅ **100%** |
| **ClientResultatsPage** | ✅ | ✅ | N/A | ✅ | ✅ | ✅ **100%** |
| **ClientFacturesPage** | ✅ | ✅ | N/A | ✅ | ✅ | ✅ **100%** |
| **DemandeDevisPage** | ✅ | ✅ | ✅ | N/A | N/A | ✅ **100%** |

**Conclusion Pages Client**: ✅ **TOUTES CONNECTÉES**

---

## 🏢 PAGES DASHBOARD (ADMIN) - GUIDE D'IMPLÉMENTATION

### 1. ⏳ **DashboardHomePage.tsx** 

**Objectif**: Afficher KPIs globaux et activité récente

#### Données mockées actuelles:
```typescript
- 128 Échantillons en cours (+12%)
- 54 Essais planifiés
- 7 Non-conformités ouvertes
- 98.2% Taux de conformité
- Liste d'activités récentes
```

#### API à connecter:
```typescript
const loadDashboard = async () => {
  try {
    setIsLoading(true)
    const statsData = await api.dashboard.stats()
    const activitiesData = await api.dashboard.activities({ limit: 10 })
    const kpisData = await api.dashboard.kpis()
    
    setStats(statsData)
    setActivities(activitiesData.results || [])
    setKpis(kpisData)
  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    setIsLoading(false)
  }
}
```

#### Mapping des champs:
```typescript
// Backend → Frontend
echantillons_en_cours → Échantillons en cours
essais_planifies → Essais planifiés
non_conformites_ouvertes → Non-conformités
taux_conformite → Taux de conformité
activites[] → Liste d'activités
```

#### Code d'implémentation:
```tsx
import { useState, useEffect } from 'react'
import api from '../../../services/api'

export function DashboardHomePage() {
  const [stats, setStats] = useState<any>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [kpis, setKpis] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setIsLoading(true)
      const [statsData, activitiesData, kpisData] = await Promise.all([
        api.dashboard.stats(),
        api.dashboard.activities({ limit: 10 }),
        api.dashboard.kpis()
      ])
      
      setStats(statsData)
      setActivities(activitiesData.results || activitiesData || [])
      setKpis(kpisData)
    } catch (error) {
      console.error('Erreur chargement dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="lanema-card p-5 animate-pulse">
              <div className="h-10 w-10 bg-slate-200 rounded-lg mb-3"></div>
              <div className="h-8 w-16 bg-slate-200 rounded mb-2"></div>
              <div className="h-4 w-32 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="lanema-card p-5">
          <div className="text-2xl font-semibold text-slate-900 mb-1">
            {stats?.echantillons_en_cours || 0}
          </div>
          <div className="text-xs text-slate-500 font-medium">Échantillons en cours</div>
        </div>
        {/* Autres KPIs... */}
      </div>
      
      {/* Activities */}
      <div className="lanema-card p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-5">Activité récente</h2>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
              <div className="text-sm text-slate-700">{activity.description}</div>
              <span className="text-xs text-slate-500">{activity.created_at}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

---

### 2. ⏳ **ClientsPage.tsx**

**Objectif**: Gérer les clients avec tableau et formulaire d'ajout

#### Fonctionnalités requises:
- ✅ Liste des clients avec recherche
- ✅ Tableau avec colonnes: Nom, Email, Type, Statut, Actions
- ✅ Formulaire modal d'ajout/édition
- ✅ Stats: Total clients, Actifs, Nouveaux ce mois

#### API à connecter:
```typescript
// Liste
const data = await api.clientsAdmin.list()

// Créer
const newClient = await api.clientsAdmin.create({
  raison_sociale: '...',
  email: '...',
  type_subscription: '...',
  adresse: '...',
  telephone: '...'
})

// Modifier
const updated = await api.clientsAdmin.update(id, {...})

// Stats
const stats = await api.clientsAdmin.stats()
```

#### Structure du formulaire:
```typescript
interface ClientFormData {
  raison_sociale: string
  email: string
  type_subscription: 'BASIC' | 'PREMIUM' | 'ENTERPRISE'
  adresse: string
  telephone: string
  siret?: string
  contact_nom?: string
}
```

#### Code d'implémentation (avec formulaire):
```tsx
import { useState, useEffect } from 'react'
import api from '../../../services/api'

export function ClientsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    raison_sociale: '',
    email: '',
    type_subscription: 'BASIC',
    adresse: '',
    telephone: ''
  })

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      setIsLoading(true)
      const data = await api.clientsAdmin.list()
      setClients(data.results || data || [])
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.clientsAdmin.create(formData)
      setShowModal(false)
      setFormData({ raison_sociale: '', email: '', type_subscription: 'BASIC', adresse: '', telephone: '' })
      loadClients()
    } catch (error) {
      console.error('Erreur création:', error)
    }
  }

  const filteredClients = clients.filter(c =>
    c.raison_sociale?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header avec bouton d'ajout */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Clients</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-lanema-blue-600 text-white rounded-lg hover:bg-lanema-blue-700"
        >
          Nouveau client
        </button>
      </div>

      {/* Recherche */}
      <input
        type="text"
        placeholder="Rechercher..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg"
      />

      {/* Tableau */}
      <div className="lanema-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Raison sociale</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => (
              <tr key={client.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 text-sm font-medium text-slate-900">{client.raison_sociale}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{client.email}</td>
                <td className="px-4 py-3 text-sm">{client.type_subscription}</td>
                <td className="px-4 py-3">
                  <button className="text-sm text-lanema-blue-600 hover:underline">Éditer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal formulaire */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Nouveau client</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Raison sociale"
                value={formData.raison_sociale}
                onChange={(e) => setFormData({...formData, raison_sociale: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <select
                value={formData.type_subscription}
                onChange={(e) => setFormData({...formData, type_subscription: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="BASIC">Basic</option>
                <option value="PREMIUM">Premium</option>
                <option value="ENTERPRISE">Enterprise</option>
              </select>
              <input
                type="text"
                placeholder="Adresse"
                value={formData.adresse}
                onChange={(e) => setFormData({...formData, adresse: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="tel"
                placeholder="Téléphone"
                value={formData.telephone}
                onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 px-4 py-2 bg-lanema-blue-600 text-white rounded-lg">
                  Créer
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
```

---

### 3. ⏳ **EchantillonsPage.tsx** (Dashboard)

**Objectif**: Gérer les échantillons (admin) avec formulaire d'ajout

#### API:
```typescript
api.echantillons.list()
api.echantillons.create(data)
api.echantillons.update(id, data)
```

#### Champs du formulaire:
```typescript
{
  code_echantillon: string     // Auto-généré ou manuel
  designation: string
  type_materiau: string
  statut: 'RECEPTIONNE' | 'EN_ANALYSE' | 'TERMINE' | 'ARCHIVE'
  localisation: string
  date_reception: date
  demande_devis_id: number
}
```

---

### 4. ⏳ **EssaisPage.tsx**

**Objectif**: Gérer les essais avec formulaire et résultats

#### API:
```typescript
api.essais.list()
api.essais.create(data)
api.essais.update(id, data)
```

#### Champs du formulaire:
```typescript
{
  echantillon_id: number
  type_essai: string
  norme: string
  date_execution: date
  date_validation: date
  resultat: string
  valeur: string
  conforme: boolean
  valideur: string
  rapport_pdf: file
}
```

---

### 5. ⏳ **FacturationPage.tsx**

**Objectif**: Gérer factures avec génération et paiement

#### API:
```typescript
api.factures.list()
api.factures.create(data)
api.factures.pay(id, paymentData)
api.factures.stats()
```

#### Champs du formulaire:
```typescript
{
  client_id: number
  demandes_ids: number[]
  montant_ht: number
  tva: number
  montant_ttc: number
  date_emission: date
  date_echeance: date
  objet: string
}
```

---

### 6. ⏳ **StockPage.tsx**

**Objectif**: Gérer stock avec mouvements

#### API:
```typescript
api.stock.list()
api.stock.create(data)
api.stock.update(id, data)
api.stock.mouvements()
api.stock.stats()
```

#### Champs du formulaire:
```typescript
{
  nom: string
  reference: string
  categorie: string
  quantite: number
  unite: string
  seuil_alerte: number
  fournisseur: string
  prix_unitaire: number
}
```

---

### 7. ⏳ **MetrologiePage.tsx**

**Objectif**: Gérer équipements et étalonnages

#### API:
```typescript
api.metrologie.list()
api.metrologie.create(data)
api.metrologie.etalonnages()
api.metrologie.stats()
```

#### Champs du formulaire:
```typescript
{
  nom: string
  reference: string
  type: string
  statut: 'OPERATIONNEL' | 'EN_ETALONNAGE' | 'HS'
  date_dernier_etalonnage: date
  date_prochain_etalonnage: date
  localisation: string
}
```

---

### 8. ⏳ **QualitePage.tsx**

**Objectif**: Gérer non-conformités et audits

#### API:
```typescript
api.qualite.nonConformites()
api.qualite.create(data)
api.qualite.audits()
api.qualite.stats()
```

#### Champs du formulaire Non-conformité:
```typescript
{
  type: string
  description: string
  gravite: 'MINEURE' | 'MAJEURE' | 'CRITIQUE'
  echantillon_id?: number
  essai_id?: number
  action_corrective: string
  responsable: string
  date_cloture: date
}
```

---

### 9. ⏳ **ReportingPage.tsx**

**Objectif**: Générer rapports et stats

#### API:
```typescript
api.reporting.stats()
api.reporting.generate(type, params)
api.reporting.rapports()
```

#### Types de rapports:
- Rapport mensuel d'activité
- Rapport qualité
- Rapport client
- Rapport financier

---

### 10. ⏳ **NotificationsPage.tsx**

**Objectif**: Gérer notifications

#### API:
```typescript
api.notifications.list()
api.notifications.markAsRead(id)
api.notifications.markAllAsRead()
api.notifications.unreadCount()
```

#### Structure notification:
```typescript
{
  id: number
  type: string
  titre: string
  message: string
  lu: boolean
  created_at: date
}
```

---

## 🎨 COMPOSANTS RÉUTILISABLES À CRÉER

### Modal générique:
```tsx
// src/components/Modal.tsx
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
```

### Tableau générique:
```tsx
// src/components/Table.tsx
interface Column {
  key: string
  label: string
  render?: (value: any, row: any) => React.ReactNode
}

interface TableProps {
  columns: Column[]
  data: any[]
  isLoading?: boolean
}

export function Table({ columns, data, isLoading }: TableProps) {
  if (isLoading) {
    return <div>Loading...</div>
  }
  
  return (
    <div className="lanema-card overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-sm">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

---

## 📝 CHECKLIST COMPLÈTE PAR PAGE

### Pages Client ✅
- [x] ClientDashboard - API connectée, loading, stats
- [x] ClientDemandesPage - API connectée, filtres, actions
- [x] ClientEchantillonsPage - API connectée, recherche, stats
- [x] ClientResultatsPage - API connectée, filtres, téléchargement
- [x] ClientFacturesPage - API connectée, paiement, téléchargement
- [x] DemandeDevisPage - API connectée, upload fichiers

### Pages Dashboard ⏳
- [ ] DashboardHomePage - KPIs, activités récentes
- [ ] ClientsPage - CRUD complet avec formulaire
- [ ] EchantillonsPage - CRUD avec QR codes
- [ ] EssaisPage - CRUD avec validation résultats
- [ ] FacturationPage - Génération, paiements
- [ ] StockPage - Gestion stock, mouvements
- [ ] MetrologiePage - Équipements, étalonnages
- [ ] QualitePage - Non-conformités, audits
- [ ] ReportingPage - Génération rapports
- [ ] NotificationsPage - Liste, marquer lu

---

## 🚀 PROCHAINES ÉTAPES

1. **Priorité HAUTE** 
   - ✅ Service API complet
   - ⏳ DashboardHomePage
   - ⏳ ClientsPage avec formulaire

2. **Priorité MOYENNE**
   - ⏳ EchantillonsPage (dashboard)
   - ⏳ EssaisPage avec formulaire
   - ⏳ FacturationPage

3. **Priorité BASSE**
   - ⏳ Autres pages dashboard
   - ⏳ Composants réutilisables
   - ⏳ Tests end-to-end

---

## 💡 CONSEILS D'IMPLÉMENTATION

### Pattern général pour toutes les pages:
```typescript
1. Import API et hooks
2. Définir states (data, loading, errors, modals, form)
3. useEffect pour chargement initial
4. Fonctions CRUD (load, create, update, delete)
5. Handlers formulaire (onChange, onSubmit)
6. Filtres et recherche
7. UI conditionnelle (loading, empty, error)
8. Render principal
```

### Gestion des erreurs:
```typescript
try {
  const data = await api.module.action()
  // Success
} catch (error) {
  console.error('Erreur:', error)
  setError(error.message || 'Une erreur est survenue')
  // Toast notification (optionnel)
}
```

### États de chargement:
```typescript
{isLoading ? (
  <div>Loading skeleton...</div>
) : data.length === 0 ? (
  <div>Empty state...</div>
) : (
  <div>Actual content...</div>
)}
```

---

## 📚 RESSOURCES

- **API Service**: `src/services/api.ts`
- **Types Backend**: Voir models Django
- **Styles**: TailwindCSS + classes `lanema-*`
- **Icons**: Heroicons (déjà dans le code)

---

**Fin du guide - Toutes les spécifications pour connexion complète** 🎉
