# ⚙️ WORKFLOW: ACTIONS MANUELLES vs AUTOMATIQUES

Détail complet de toutes les étapes avec indication MANUEL 🟠 ou AUTO 🟢

---

## 📊 VUE D'ENSEMBLE

```
PHASE 1: DEMANDE DE DEVIS (PRÉ-ENGAGEMENT)
├─ ÉTAPE 1-2: Création et génération devis
│  ├─ 🟠 Client soumet formulaire
│  └─ 🟢 Système génère proforma BROUILLON
│
├─ ÉTAPE 3: Validation admin
│  ├─ 🟠 Admin révise
│  ├─ 🟠 Admin ajuste prix (optionnel)
│  ├─ 🟠 Admin valide
│  └─ 🟢 Email envoyé au client
│
└─ ÉTAPE 4: Décision client
   ├─ 🟠 Client accepte OU refuse
   └─ 🟢 Si accepté: Création DemandeAnalyse

PHASE 2: DEMANDE D'ANALYSE (ENGAGEMENT)
├─ ÉTAPE 5: (automatique post-acceptation)
│  └─ 🟢 DemandeAnalyse créée (EN_ATTENTE_ECHANTILLONS)
│
├─ ÉTAPE 6: Dépôt échantillons
│  ├─ 🟠 Client va au labo physiquement
│  ├─ 🟠 Admin réceptionne
│  ├─ 🟠 Admin confirme dans système
│  └─ 🟢 Email confirmation au client
│
├─ ÉTAPE 7: Analyses
│  ├─ 7.1: Démarrage
│  │  ├─ 🟠 Admin clique "Démarrer"
│  │  └─ 🟢 Email envoyé au client
│  │
│  ├─ 7.2: Réalisation
│  │  ├─ 🟠 Techniciens font analyses (labo)
│  │  └─ 🟠 Techniciens saisissent résultats
│  │
│  └─ 7.3: Finalisation
│     ├─ 🟠 Admin clique "Terminer"
│     ├─ 🟠 Admin ajoute observations
│     └─ 🟢 Email résultats prêts
│
├─ ÉTAPE 8: Résultats disponibles
│  ├─ 🟢 Génération rapport PDF
│  ├─ 🟢 Génération facture finale
│  └─ 🟢 Email avec liens
│
└─ ÉTAPE 9: Paiement et téléchargement
   ├─ 🟠 Client paye (en ligne ou au labo)
   ├─ 🟠/🟢 Enregistrement paiement
   ├─ 🟢 Email confirmation
   └─ 🟠 Client télécharge résultats
```

---

## 🔍 DÉTAIL PAR PHASE

---

### **PHASE 1: DEMANDE DE DEVIS**

#### **ÉTAPE 1-2: Création demande et génération proforma**

| Action | Type | Acteur | Outil | Temps |
|--------|------|--------|-------|-------|
| Remplir formulaire demande | 🟠 MANUEL | Client | Interface web | 2-3 min |
| Calculer montant selon tarifs | 🟢 AUTO | Système | Backend | < 1s |
| Générer numéro proforma | 🟢 AUTO | Système | Backend | < 1s |
| Créer proforma BROUILLON | 🟢 AUTO | Système | Base de données | < 1s |
| Générer PDF estimatif | 🟢 AUTO | Système | PDF generator | 2-3s |
| Envoyer email avec PDF | 🟢 AUTO | Système | Mail service | < 1s |

**Résultat:**
- ✅ Client reçoit PDF estimatif immédiatement
- ✅ Message: "Ceci est un devis estimatif..."

---

#### **ÉTAPE 3: Validation admin**

| Action | Type | Acteur | Outil | Temps |
|--------|------|--------|-------|-------|
| Voir liste proformas BROUILLON | 🟠 MANUEL | Admin | `/app/admin/proformas` | 10s |
| Ouvrir détails demande | 🟠 MANUEL | Admin | Interface web | 5s |
| Vérifier informations | 🟠 MANUEL | Admin | Écran | 30s-2min |
| Ajuster montants (optionnel) | 🟠 MANUEL | Admin | Modal ajustement | 1-2 min |
| Cliquer "Valider" | 🟠 MANUEL | Admin | Bouton | < 1s |
| Changer statut → VALIDEE | 🟢 AUTO | Système | Backend | < 1s |
| Régénérer PDF final | 🟢 AUTO | Système | PDF generator | 2-3s |
| Envoyer email au client | 🟢 AUTO | Système | Mail service | < 1s |

**Résultat:**
- ✅ Client reçoit email "Votre devis est validé"
- ✅ PDF final disponible

---

#### **ÉTAPE 4: Décision client**

| Action | Type | Acteur | Outil | Temps |
|--------|------|--------|-------|-------|
| Voir devis validé | 🟠 MANUEL | Client | `/client/demandes` | 10s |
| Télécharger PDF (optionnel) | 🟠 MANUEL | Client | Bouton | 5s |
| Cliquer "Accepter" ou "Refuser" | 🟠 MANUEL | Client | Bouton | < 1s |
| Si accepté: Changer statut proforma | 🟢 AUTO | Système | Backend | < 1s |
| Si accepté: Créer DemandeAnalyse | 🟢 AUTO | Système | Backend | < 1s |
| Si accepté: Générer numéro DAN | 🟢 AUTO | Système | Backend | < 1s |
| Si accepté: Email confirmation | 🟢 AUTO | Système | Mail service | < 1s |

**Résultat:**
- ✅ DemandeAnalyse créée automatiquement
- ✅ Client voit "PHASE 2 - ENGAGEMENT"
- ✅ Instructions dépôt affichées

---

### **PHASE 2: DEMANDE D'ANALYSE**

#### **ÉTAPE 5: Création demande analyse (automatique)**

| Action | Type | Acteur | Outil | Temps |
|--------|------|--------|-------|-------|
| Créer DemandeAnalyse | 🟢 AUTO | Système | Backend (signal) | < 1s |
| Lier à proforma acceptée | 🟢 AUTO | Système | Foreign key | < 1s |
| Générer numéro DAN-YYYY-XXXX | 🟢 AUTO | Système | Backend | < 1s |
| Statut: EN_ATTENTE_ECHANTILLONS | 🟢 AUTO | Système | Backend | < 1s |
| Copier montants de la proforma | 🟢 AUTO | Système | Backend | < 1s |

**Résultat:**
- ✅ Demande analyse prête
- ✅ En attente dépôt échantillons

---

#### **ÉTAPE 6: Dépôt et réception échantillons**

| Action | Type | Acteur | Outil | Temps |
|--------|------|--------|-------|-------|
| Se déplacer au laboratoire | 🟠 MANUEL | Client | Physique | 10-60 min |
| Apporter échantillons | 🟠 MANUEL | Client | Physique | - |
| Donner référence DAN-YYYY-XXXX | 🟠 MANUEL | Client | Verbal | < 1 min |
| Réceptionner échantillons | 🟠 MANUEL | Admin/Technicien | Physique | 5 min |
| Vérifier nombre/état | 🟠 MANUEL | Admin/Technicien | Visuel | 2-5 min |
| Étiqueter échantillons | 🟠 MANUEL | Admin/Technicien | Physique | 5 min |
| Ouvrir `/app/admin/analyses` | 🟠 MANUEL | Admin | Interface web | 10s |
| Trouver demande DAN-YYYY-XXXX | 🟠 MANUEL | Admin | Interface web | 10s |
| Cliquer "Confirmer réception" | 🟠 MANUEL | Admin | Bouton | < 1s |
| Changer statut → ECHANTILLONS_RECUS | 🟢 AUTO | Système | Backend | < 1s |
| Horodater date_depot | 🟢 AUTO | Système | Backend | < 1s |
| Email confirmation au client | 🟢 AUTO | Système | Mail service | < 1s |

**Résultat:**
- ✅ Échantillons physiquement au labo
- ✅ Client notifié de la réception
- ✅ Statut: ECHANTILLONS_RECUS

---

#### **ÉTAPE 7.1: Démarrage analyse**

| Action | Type | Acteur | Outil | Temps |
|--------|------|--------|-------|-------|
| Planifier analyses | 🟠 MANUEL | Responsable labo | Planning | 5-10 min |
| Ouvrir `/app/admin/analyses` | 🟠 MANUEL | Admin/Responsable | Interface web | 10s |
| Trouver demande | 🟠 MANUEL | Admin | Interface web | 10s |
| Cliquer "Démarrer analyse" | 🟠 MANUEL | Admin | Bouton | < 1s |
| Changer statut → EN_COURS | 🟢 AUTO | Système | Backend | < 1s |
| Horodater date_debut | 🟢 AUTO | Système | Backend | < 1s |
| Email au client | 🟢 AUTO | Système | Mail service | < 1s |

**Résultat:**
- ✅ Analyses officiellement démarrées
- ✅ Client informé du début
- ✅ Statut: EN_COURS

---

#### **ÉTAPE 7.2: Réalisation analyses**

| Action | Type | Acteur | Outil | Temps |
|--------|------|--------|-------|-------|
| Préparer échantillons | 🟠 MANUEL | Technicien | Labo | 15-30 min |
| Effectuer mesures pH | 🟠 MANUEL | Technicien | pH-mètre | 5-10 min/éch. |
| Effectuer analyses chimiques | 🟠 MANUEL | Technicien | Équipements labo | 1-3h/éch. |
| Effectuer tests microbiologiques | 🟠 MANUEL | Technicien | Incubateur | 24-48h |
| Noter résultats sur papier | 🟠 MANUEL | Technicien | Cahier labo | 5 min |
| Saisir résultats dans système | 🟠 MANUEL | Technicien | Interface web | 10-15 min |
| Vérifier cohérence résultats | 🟠 MANUEL | Responsable | Écran | 5-10 min |

**Résultat:**
- ✅ Analyses physiques terminées
- ✅ Résultats saisis dans le système
- ✅ Prêt pour validation finale

**Note:** Durée totale 1-5 jours selon type d'analyse

---

#### **ÉTAPE 7.3: Finalisation analyse**

| Action | Type | Acteur | Outil | Temps |
|--------|------|--------|-------|-------|
| Relire tous résultats | 🟠 MANUEL | Responsable | Écran | 10 min |
| Valider conformité résultats | 🟠 MANUEL | Responsable | Écran | 5 min |
| Rédiger observations | 🟠 MANUEL | Admin/Responsable | Formulaire | 5 min |
| Ouvrir `/app/admin/analyses` | 🟠 MANUEL | Admin | Interface web | 10s |
| Cliquer "Terminer analyse" | 🟠 MANUEL | Admin | Bouton | < 1s |
| Saisir observations finales | 🟠 MANUEL | Admin | Modal | 2 min |
| Confirmer | 🟠 MANUEL | Admin | Bouton | < 1s |
| Changer statut → TERMINEE | 🟢 AUTO | Système | Backend | < 1s |
| Horodater date_fin | 🟢 AUTO | Système | Backend | < 1s |
| Email résultats prêts | 🟢 AUTO | Système | Mail service | < 1s |

**Résultat:**
- ✅ Analyses officiellement terminées
- ✅ Client notifié
- ✅ Statut: TERMINEE

---

#### **ÉTAPE 8: Génération résultats et facture**

| Action | Type | Acteur | Outil | Temps |
|--------|------|--------|-------|-------|
| Compiler résultats | 🟢 AUTO | Système | Backend | 1s |
| Appliquer template rapport | 🟢 AUTO | Système | PDF generator | 2s |
| Générer graphiques | 🟢 AUTO | Système | Chart library | 1s |
| Générer certificat PDF | 🟢 AUTO | Système | PDF generator | 3s |
| Créer facture finale | 🟢 AUTO | Système | Backend | 1s |
| Générer numéro facture | 🟢 AUTO | Système | Backend | < 1s |
| Générer PDF facture | 🟢 AUTO | Système | PDF generator | 2s |
| Email avec liens téléchargement | 🟢 AUTO | Système | Mail service | < 1s |
| Activer boutons téléchargement | 🟢 AUTO | Système | Frontend | < 1s |

**Résultat:**
- ✅ Rapport PDF généré automatiquement
- ✅ Facture finale créée
- ✅ Client peut voir montant final
- ✅ Email avec tous les liens

**Note:** TOUT automatique, aucune intervention humaine!

---

#### **ÉTAPE 9: Paiement et téléchargement**

##### **Option A: Paiement en ligne**

| Action | Type | Acteur | Outil | Temps |
|--------|------|--------|-------|-------|
| Cliquer "💳 Paiement" | 🟠 MANUEL | Client | Bouton | < 1s |
| Redirection passerelle paiement | 🟢 AUTO | Système | API paiement | 1s |
| Choisir mode (MTN/Orange/Moov) | 🟠 MANUEL | Client | Interface | 10s |
| Saisir numéro téléphone | 🟠 MANUEL | Client | Formulaire | 15s |
| Valider sur téléphone | 🟠 MANUEL | Client | App mobile | 30s |
| Callback de confirmation | 🟢 AUTO | Opérateur | Webhook | < 1s |
| Marquer facture PAYEE | 🟢 AUTO | Système | Backend | < 1s |
| Changer statut → RESULTATS_ENVOYES | 🟢 AUTO | Système | Backend | < 1s |
| Email confirmation paiement | 🟢 AUTO | Système | Mail service | < 1s |
| Déverrouiller téléchargements | 🟢 AUTO | Système | Frontend | < 1s |

##### **Option B: Paiement au laboratoire**

| Action | Type | Acteur | Outil | Temps |
|--------|------|--------|-------|-------|
| Se déplacer au labo | 🟠 MANUEL | Client | Physique | 10-60 min |
| Payer en espèces/chèque | 🟠 MANUEL | Client | Physique | 5 min |
| Recevoir reçu papier | 🟠 MANUEL | Comptable | Imprimante | 2 min |
| Ouvrir interface facturation | 🟠 MANUEL | Admin/Comptable | Web | 10s |
| Trouver facture | 🟠 MANUEL | Admin | Web | 10s |
| Cliquer "Enregistrer paiement" | 🟠 MANUEL | Admin | Bouton | < 1s |
| Saisir détails paiement | 🟠 MANUEL | Admin | Formulaire | 1 min |
| Marquer facture PAYEE | 🟢 AUTO | Système | Backend | < 1s |
| Changer statut → RESULTATS_ENVOYES | 🟢 AUTO | Système | Backend | < 1s |
| Email confirmation | 🟢 AUTO | Système | Mail service | < 1s |

##### **Téléchargement résultats**

| Action | Type | Acteur | Outil | Temps |
|--------|------|--------|-------|-------|
| Ouvrir `/client/demandes` | 🟠 MANUEL | Client | Web | 10s |
| Cliquer "📄 Télécharger résultats" | 🟠 MANUEL | Client | Bouton | < 1s |
| Servir fichier PDF | 🟢 AUTO | Système | Backend | 1-2s |
| Sauvegarder sur ordinateur | 🟠 MANUEL | Client | Navigateur | 2s |
| Télécharger certificat (optionnel) | 🟠 MANUEL | Client | Bouton | 2s |
| Télécharger facture (optionnel) | 🟠 MANUEL | Client | Bouton | 2s |

**Résultat:**
- ✅ Paiement confirmé
- ✅ Client a tous les documents
- ✅ Workflow terminé!

---

## 📊 STATISTIQUES

### Répartition MANUEL vs AUTO

**PHASE 1:**
- Actions manuelles: 5-7
- Actions automatiques: 10-12
- **Automatisation: ~65%**

**PHASE 2:**
- Actions manuelles: 15-20
- Actions automatiques: 15-18
- **Automatisation: ~50%**

### Durées typiques

| Phase | Durée minimale | Durée moyenne | Durée maximale |
|-------|---------------|---------------|----------------|
| PHASE 1 (Devis) | 1 heure | 4-8 heures | 2-3 jours |
| PHASE 2 (Analyses) | 1 jour | 3-5 jours | 1-2 semaines |
| **TOTAL** | **1 jour** | **3-7 jours** | **2-3 semaines** |

### Points d'intervention humaine

**PHASE 1:**
1. Client crée demande (obligatoire)
2. Admin valide devis (optionnel mais recommandé)
3. Client accepte/refuse (obligatoire)

**PHASE 2:**
4. Client dépose échantillons (obligatoire - physique)
5. Admin confirme réception (obligatoire)
6. Admin démarre analyses (obligatoire)
7. Techniciens font analyses (obligatoire - travail labo)
8. Admin termine analyses (obligatoire)
9. Client paye (obligatoire)

**Total: 9 points d'intervention humaine**

---

## 🚀 AUTOMATISATIONS FUTURES POSSIBLES

### Réduire les actions manuelles:

1. **QR Code échantillons**
   - Client scanne QR à l'arrivée
   - Auto-confirmation dépôt
   - **Économie: 2 actions manuelles**

2. **Intégration équipements labo**
   - API des appareils de mesure
   - Auto-saisie résultats
   - **Économie: 5-10 actions manuelles**

3. **Paiement mobile intégré**
   - API MTN/Orange/Moov
   - Auto-confirmation sans admin
   - **Économie: 2-3 actions manuelles**

4. **IA validation résultats**
   - Détection anomalies automatique
   - Suggestions observations
   - **Économie: 2 actions manuelles**

5. **Chatbot client**
   - Création demande assistée
   - FAQ automatique
   - **Amélioration UX**

**Potentiel d'automatisation totale: ~75-80%**

---

## ✅ RÉSUMÉ

### Ce qui est DÉJÀ automatique (🟢):
- ✅ Génération devis
- ✅ Calcul montants
- ✅ Création demande analyse
- ✅ Génération PDF
- ✅ Génération facture
- ✅ Emails notifications
- ✅ Changements de statut
- ✅ Horodatage

### Ce qui NÉCESSITE intervention (🟠):
- 🟠 Décisions humaines (valider, accepter, terminer)
- 🟠 Actions physiques (dépôt échantillons, analyses labo)
- 🟠 Paiement (en ligne ou physique)
- 🟠 Téléchargements

---

**✅ WORKFLOW OPTIMISÉ AVEC BON ÉQUILIBRE AUTO/MANUEL!**
