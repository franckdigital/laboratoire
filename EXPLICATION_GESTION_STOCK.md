# 📦 Explication du Processus de Gestion de Stock LANEMA

## Vue d'ensemble

Le système de gestion de stock de LANEMA suit un processus automatisé et traçable pour gérer les articles de laboratoire.

---

## 🔄 Processus Complet

### 1. **RÉCEPTIONS** (Point d'entrée)

#### Comment ça fonctionne ?
- Quand un fournisseur livre des marchandises, une **réception** est créée
- La réception contient :
  - Numéro unique (ex: REC-2024-001)
  - Date de réception
  - Statut (conforme / non conforme)
  - Lignes de réception (détails des articles reçus)

#### Création automatique
Lors de la création d'une réception, le système crée automatiquement :
1. **Des LOTS** pour chaque article reçu
2. **Des lignes de réception** qui lient la réception aux lots
3. **Mise à jour du stock** de chaque article

#### Exemple
```
Réception REC-2024-001
├── Ligne 1: Acide Sulfurique - 50L
│   └── Crée LOT-ACID-2024-001 (50L, péremption dans 365 jours)
└── Ligne 2: Hydroxyde de Sodium - 30KG
    └── Crée LOT-HYDR-2024-001 (30KG, péremption dans 730 jours)
```

---

### 2. **LOTS** (Traçabilité)

#### Qu'est-ce qu'un lot ?
Un lot est une unité de traçabilité qui permet de suivre :
- L'origine d'un produit (quelle réception)
- La quantité initiale et restante
- La date de péremption
- L'emplacement actuel
- Le statut (ouvert/fermé)

#### Création automatique
Les lots sont créés automatiquement lors de :
- **Réception de marchandises** : Chaque ligne de réception génère un lot
- Le système assigne automatiquement :
  - Numéro de lot unique
  - Quantité initiale = quantité reçue
  - Quantité restante = quantité reçue
  - Date de péremption (si applicable)
  - Unité de mesure

#### Cycle de vie d'un lot
```
1. Création (lors de la réception)
   ↓
2. Stockage (emplacement assigné)
   ↓
3. Utilisation (quantité_restante diminue)
   ↓
4. Fin de vie :
   - Épuisé (quantité_restante = 0)
   - Périmé (date_peremption dépassée)
   - En quarantaine (problème qualité)
```

---

### 3. **ALERTES** (Surveillance automatique)

#### Types d'alertes générées automatiquement

##### a) Alerte de PÉREMPTION
- **Déclencheur** : Un lot approche de sa date de péremption (ex: 30 jours avant)
- **Niveau** : AVERTISSEMENT
- **Action** : Utiliser le lot en priorité ou le retirer

##### b) Alerte de STOCK BAS
- **Déclencheur** : `quantite_stock < seuil_alerte`
- **Niveau** : URGENT
- **Action** : Commander plus d'articles

##### c) Alerte CRITIQUE / RUPTURE
- **Déclencheur** : Article critique avec stock très bas ou nul
- **Niveau** : CRITIQUE
- **Action** : Réapprovisionnement d'urgence

#### Création automatique
Les alertes sont générées par :
1. **Tâches planifiées** (cron jobs) qui vérifient quotidiennement :
   - Les dates de péremption
   - Les niveaux de stock
2. **Événements système** :
   - Après chaque sortie de stock
   - Après chaque réception

#### Exemple
```python
# Vérification automatique quotidienne
for lot in Lot.objects.filter(date_peremption__lte=dans_30_jours):
    Alerte.objects.create(
        titre=f"Péremption proche - {lot.article.designation}",
        type_alerte="PEREMPTION",
        niveau_priorite="AVERTISSEMENT"
    )
```

---

### 4. **QUARANTAINES** (Contrôle qualité)

#### Qu'est-ce qu'une quarantaine ?
Une quarantaine isole un lot suspect pour vérification qualité.

#### Création manuelle ET automatique

##### Manuelle (par un gestionnaire)
1. Un gestionnaire détecte un problème visuel/qualité
2. Il met le lot en quarantaine via l'interface
3. Le lot ne peut plus être utilisé jusqu'à décision

##### Automatique (par le système)
- Lot reçu avec anomalie signalée
- Résultat d'analyse non conforme
- Alerte de contamination

#### Statuts de quarantaine
```
EN_COURS
├── ACCEPTÉE → Lot libéré pour utilisation
└── REFUSÉE → Lot détruit ou retourné
```

#### Processus
```
1. Mise en quarantaine
   ├── Motif enregistré
   ├── Lot isolé (emplacement quarantaine)
   └── Notification envoyée
   
2. Analyse/Vérification
   ├── Tests qualité
   └── Inspection visuelle
   
3. Décision
   ├── ACCEPTÉE : Lot libéré
   └── REFUSÉE : Lot éliminé
```

---

### 5. **TRANSFERTS** (Déplacements internes)

#### Qu'est-ce qu'un transfert ?
Un transfert déplace un lot d'un emplacement à un autre.

#### Création manuelle
1. Un utilisateur demande un transfert via l'interface
2. Il spécifie :
   - Le lot à transférer
   - L'emplacement source
   - L'emplacement destination
3. Le transfert est créé avec statut "EN_ATTENTE"

#### Processus de validation
```
1. Demande de transfert (EN_ATTENTE)
   ↓
2. Validation par un responsable
   ├── valide = True
   └── execute = False
   ↓
3. Exécution physique
   ├── Déplacement réel du lot
   ├── execute = True
   └── Mise à jour de l'emplacement du lot
```

#### Exemple
```
Transfert de LOT-ACID-2024-001
├── Source: Emplacement A-01-01 (Réserve)
├── Destination: B-01-01 (Laboratoire)
├── Statut: VALIDÉ et EXÉCUTÉ
└── Traçabilité complète conservée
```

---

## 📊 Schéma du Flux de Données

```
FOURNISSEUR LIVRE
       ↓
   RÉCEPTION
       ↓
    LOTS CRÉÉS ←──────┐
       ↓               │
   STOCK MIS À JOUR    │
       ↓               │
   EMPLACEMENTS        │
       ↓               │
   UTILISATION         │
       ↓               │
   ┌──────────────┐    │
   │  ALERTES     │    │
   │  (auto)      │    │
   └──────────────┘    │
       ↓               │
   ┌──────────────┐    │
   │ QUARANTAINE  │    │
   │ (si besoin)  │────┘
   └──────────────┘
       ↓
   ┌──────────────┐
   │ TRANSFERTS   │
   │ (déplacement)│
   └──────────────┘
```

---

## 🎯 Points Clés à Retenir

### 1. **Pas de formulaire direct pour les lots**
- Les lots sont créés **automatiquement** lors des réceptions
- Vous ne créez jamais un lot manuellement
- Vous créez une **réception**, qui génère les lots

### 2. **Alertes automatiques**
- Le système surveille en permanence :
  - Les dates de péremption
  - Les niveaux de stock
  - Les articles critiques
- Vous ne créez pas d'alertes manuellement
- Elles apparaissent automatiquement

### 3. **Quarantaines flexibles**
- Peuvent être créées manuellement par un gestionnaire
- Peuvent être déclenchées automatiquement par le système
- Bloquent l'utilisation du lot jusqu'à décision

### 4. **Transferts traçables**
- Créés manuellement pour déplacer des lots
- Nécessitent validation
- Conservent l'historique complet

---

## 💡 Exemples Pratiques

### Scénario 1: Réception de marchandises
```
1. Fournisseur livre 50L d'Acide Sulfurique
2. Gestionnaire crée une réception REC-2024-001
3. Ajoute une ligne : Acide Sulfurique, 50L, péremption dans 1 an
4. Système crée automatiquement :
   - Lot LOT-ACID-2024-001
   - Quantité initiale: 50L
   - Quantité restante: 50L
   - Date péremption: dans 365 jours
5. Stock de l'article mis à jour : +50L
```

### Scénario 2: Alerte de péremption
```
1. Système vérifie quotidiennement les lots
2. Détecte LOT-GANT-2023-012 expire dans 15 jours
3. Crée automatiquement une alerte :
   - Type: PEREMPTION
   - Niveau: AVERTISSEMENT
   - Message: "Le lot LOT-GANT-2023-012 expire dans 15 jours"
4. Notification envoyée au gestionnaire
```

### Scénario 3: Mise en quarantaine
```
1. Réception d'un lot suspect LOT-SUSP-2024-001
2. Gestionnaire met en quarantaine :
   - Motif: "Anomalie visuelle détectée"
   - Lot déplacé vers zone quarantaine
3. Analyse qualité effectuée
4. Décision : REFUSÉE
5. Lot détruit, quantité mise à 0
```

### Scénario 4: Transfert interne
```
1. Laboratoire a besoin d'Acide Sulfurique
2. Technicien demande transfert :
   - Lot: LOT-ACID-2024-001
   - De: Réserve A-01-01
   - Vers: Laboratoire B-01-01
3. Responsable valide le transfert
4. Technicien exécute le déplacement physique
5. Système met à jour l'emplacement du lot
```

---

## 🔧 Données de Test Créées

Le script `populate_stock_simple.py` a créé :

- ✅ 1 Entrepôt
- ✅ 5 Emplacements
- ✅ 3 Catégories d'articles
- ✅ 5 Articles
- ✅ 3 Réceptions (dont 1 en attente)
- ✅ 8 Lots (actifs, périmés, proche péremption)
- ✅ 3 Alertes (péremption, stock bas, critique)
- ✅ 2 Quarantaines (en cours, levée)
- ✅ 2 Transferts (validé, en attente)

Vous pouvez maintenant explorer toutes les pages et comprendre comment les données sont liées !

---

## 📱 Pages à Consulter

1. **Réceptions** : http://localhost:5173/stock/receptions
   - Voir les livraisons de marchandises
   
2. **Lots** : http://localhost:5173/stock/lots
   - Voir tous les lots créés automatiquement
   
3. **Alertes** : http://localhost:5173/stock/alertes
   - Voir les alertes générées automatiquement
   
4. **Quarantaines** : http://localhost:5173/stock/quarantaines
   - Voir les lots en quarantaine
   
5. **Transferts** : http://localhost:5173/stock/transferts
   - Voir les déplacements de lots

---

## 🎓 Conclusion

Le système de gestion de stock LANEMA est conçu pour :
- **Automatiser** la création des lots et alertes
- **Tracer** chaque mouvement de stock
- **Sécuriser** avec les quarantaines
- **Optimiser** avec les alertes proactives

Vous n'avez qu'à créer des **réceptions**, le reste se fait automatiquement ! 🚀
