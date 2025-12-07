# 🧪 GUIDE TEST WORKFLOW COMPLET

Guide pour tester le workflow complet de A à Z sans attendre les actions physiques réelles.

---

## 🎯 OBJECTIF

Tester tout le workflow depuis la création de la demande jusqu'au téléchargement des résultats, en simulant toutes les étapes.

---

## 📋 PRÉREQUIS

### 1. Serveurs lancés

```bash
# Terminal 1 - Backend
cd laboratoire-backend
python manage.py runserver

# Terminal 2 - Frontend
cd laboratoire-public
npm run dev
```

### 2. Données initiales

- ✅ Au moins 1 utilisateur CLIENT
- ✅ Au moins 1 utilisateur ADMIN
- ✅ Tarifs initialisés (`python manage.py init_tarifs`)

---

## 🚀 MÉTHODE 1: TEST AUTOMATIQUE COMPLET

### **Script interactif avec pauses**

Lance le workflow complet étape par étape avec explications.

```bash
cd laboratoire-backend
python test_workflow_complet.py
```

**Ce script va:**

1. ✅ Trouver une demande en attente d'échantillons
2. ✅ Simuler ÉTAPE 6: Dépôt et confirmation échantillons
3. ✅ Simuler ÉTAPE 7.1: Démarrage analyse
4. ✅ Simuler ÉTAPE 7.2: Analyses en cours (animation)
5. ✅ Simuler ÉTAPE 7.3: Finalisation analyse
6. ✅ Simuler ÉTAPE 8: Génération résultats et facture
7. ✅ Simuler ÉTAPE 9: Paiement
8. ✅ Afficher récapitulatif complet

**À chaque étape:** Appuyez sur **Entrée** pour continuer.

---

## 🔧 MÉTHODE 2: ACTIONS MANUELLES INDIVIDUELLES

### **Menu interactif**

Lance un menu pour exécuter les actions une par une.

```bash
cd laboratoire-backend
python test_actions_admin.py
```

**Menu:**
```
1. 📋 Lister toutes les demandes
2. 📦 Confirmer réception échantillons (ÉTAPE 6)
3. 🔬 Démarrer analyse (ÉTAPE 7)
4. ✅ Terminer analyse (ÉTAPE 7)
5. 💳 Enregistrer paiement (ÉTAPE 9)
6. 📄 Afficher détails d'une demande
7. 🚪 Quitter
```

### **Ligne de commande directe**

```bash
# Lister les demandes
python test_actions_admin.py list

# Confirmer réception échantillons
python test_actions_admin.py confirmer DAN-2025-0001

# Démarrer analyse
python test_actions_admin.py demarrer DAN-2025-0001

# Terminer analyse
python test_actions_admin.py terminer DAN-2025-0001

# Enregistrer paiement
python test_actions_admin.py paiement DAN-2025-0001

# Voir détails
python test_actions_admin.py details DAN-2025-0001
```

---

## 🎬 SCÉNARIO COMPLET PAS À PAS

### **PHASE 0: Préparation**

#### 1. Créer une demande de devis (interface client)

```
1. Ouvrir http://localhost:5173/login
2. Se connecter comme CLIENT
3. Aller sur "Mes demandes"
4. Cliquer "+ Nouvelle demande"
5. Remplir le formulaire:
   - Type: CHIMIE_ALIMENTAIRE_INDUSTRIELLE
   - Catégorie: Analyses physico-chimiques des eaux
   - Nombre échantillons: 1
   - Priorité: NORMALE
6. Soumettre
```

**Résultat:** 
- ✅ Proforma BROUILLON créée automatiquement
- ✅ Client voit "PHASE 1 - PRÉ-ENGAGEMENT"
- ✅ Peut télécharger l'estimatif

---

#### 2. Admin valide le devis

```
1. Se déconnecter
2. Se connecter comme ADMIN
3. Aller sur "Administration" → "Proformas"
4. Trouver la proforma BROUILLON
5. Cliquer "Valider"
6. Confirmer
```

**Résultat:**
- ✅ Proforma passe à VALIDEE
- ✅ Client voit "PHASE 1 - DÉCISION CLIENT"
- ✅ Email envoyé au client (simulation)

---

#### 3. Client accepte le devis

```
1. Se reconnecter comme CLIENT
2. Aller sur "Mes demandes"
3. Trouver la demande avec devis VALIDEE
4. Cliquer "✅ Accepter ce devis"
5. Confirmer
```

**Résultat:**
- ✅ Proforma passe à ACCEPTEE
- ✅ DemandeAnalyse créée automatiquement (EN_ATTENTE_ECHANTILLONS)
- ✅ Client voit "PHASE 2 - ENGAGEMENT"
- ✅ Instructions de dépôt affichées

---

### **PHASE 2: Analyses (À SIMULER)**

**État actuel:** DAN-2025-0001 en EN_ATTENTE_ECHANTILLONS

---

#### OPTION A: Script automatique

```bash
cd laboratoire-backend
python test_workflow_complet.py
```

Suivez les instructions à l'écran, appuyez sur Entrée à chaque étape.

---

#### OPTION B: Menu interactif

```bash
cd laboratoire-backend
python test_actions_admin.py
```

**Étapes:**

1. **Confirmer échantillons**
   ```
   Choix: 2
   Numéro: DAN-2025-0001
   ```

2. **Démarrer analyse**
   ```
   Choix: 3
   Numéro: DAN-2025-0001
   ```

3. **Terminer analyse**
   ```
   Choix: 4
   Numéro: DAN-2025-0001
   Observations: Analyses terminées. Résultats conformes.
   ```

4. **Enregistrer paiement**
   ```
   Choix: 5
   Numéro: DAN-2025-0001
   ```

---

#### OPTION C: Ligne de commande

```bash
cd laboratoire-backend

# Étape 6
python test_actions_admin.py confirmer DAN-2025-0001

# Étape 7.1
python test_actions_admin.py demarrer DAN-2025-0001

# Étape 7.3
python test_actions_admin.py terminer DAN-2025-0001

# Étape 9
python test_actions_admin.py paiement DAN-2025-0001
```

---

### **VÉRIFICATION: Interface client**

Après chaque action, vérifiez dans l'interface client:

```
1. Ouvrir http://localhost:5173/client/demandes
2. Observer les changements en temps réel:
   - Badge PHASE 2
   - Changement de statut
   - Nouveaux messages
   - Boutons activés/désactivés
```

**Évolution attendue:**

```
EN_ATTENTE_ECHANTILLONS (Étape 6)
   ↓ Confirmer réception
ECHANTILLONS_RECUS
   ↓ Démarrer analyse
EN_COURS (Étape 7)
   ↓ Terminer analyse
TERMINEE (Étape 8)
   ↓ Enregistrer paiement
RESULTATS_ENVOYES (Étape 9)
```

---

## 📊 VÉRIFICATION INTERFACE ADMIN

### **Page Admin Analyses**

```
URL: http://localhost:5173/app/admin/analyses
```

**Vérifications:**

1. **Timeline visuelle** pour chaque étape
2. **Boutons d'action** contextuels:
   - EN_ATTENTE_ECHANTILLONS → "Confirmer réception"
   - ECHANTILLONS_RECUS → "Démarrer analyse"
   - EN_COURS → "Terminer analyse"

3. **Statistiques** mises à jour en temps réel

---

## 🧪 TESTS SPÉCIFIQUES

### Test 1: Workflow complet sans interruption

```bash
# Lancer le script automatique
python test_workflow_complet.py

# À chaque pause, appuyez rapidement sur Entrée
# Durée totale: ~30 secondes
```

**Résultat attendu:** Workflow complet de ÉTAPE 6 à ÉTAPE 9.

---

### Test 2: Vérification des transitions de statut

```bash
# Lister l'état initial
python test_actions_admin.py list

# Noter le numéro de la demande (ex: DAN-2025-0001)

# Exécuter chaque action et vérifier le statut après
python test_actions_admin.py details DAN-2025-0001
python test_actions_admin.py confirmer DAN-2025-0001
python test_actions_admin.py details DAN-2025-0001

python test_actions_admin.py demarrer DAN-2025-0001
python test_actions_admin.py details DAN-2025-0001

# etc.
```

**Résultat attendu:** Chaque `details` affiche le nouveau statut.

---

### Test 3: Chronologie complète

```bash
# Après avoir terminé le workflow
python test_actions_admin.py details DAN-2025-0001
```

**Résultat attendu:**
```
📅 Chronologie:
   Créée le: 29/11/2025 23:10
   Dépôt: 29/11/2025 23:12
   Début: 29/11/2025 23:14
   Fin: 29/11/2025 23:16
```

---

## 📱 TESTS INTERFACE CLIENT

### Vérifications visuelles

Après chaque étape backend, rafraîchir la page client:

**ÉTAPE 6 (EN_ATTENTE_ECHANTILLONS):**
- ✅ Badge violet "PHASE 2 - ENGAGEMENT"
- ✅ Box ambre "ÉTAPE 6 - Dépôt d'échantillons"
- ✅ Adresse labo visible
- ✅ Référence DAN-2025-0001 en gros

**ÉTAPE 6 (ECHANTILLONS_RECUS):**
- ✅ Box bleue "ÉTAPE 7 - Échantillons reçus"
- ✅ Message confirmation

**ÉTAPE 7 (EN_COURS):**
- ✅ Box violette "ÉTAPE 7 - Analyses en cours"
- ✅ Message progression

**ÉTAPE 8 (TERMINEE):**
- ✅ Box verte "ÉTAPE 8 - Résultats disponibles"
- ✅ Rappel paiement (ÉTAPE 9)
- ✅ 2 boutons: "Télécharger résultats" + "Paiement"

**ÉTAPE 9 (RESULTATS_ENVOYES):**
- ✅ Boutons actifs
- ✅ Client peut télécharger

---

## 🎯 RÉCAPITULATIF

### **Pour tester rapidement:**

```bash
# Terminal Backend
cd laboratoire-backend
python test_workflow_complet.py
# Appuyez sur Entrée à chaque étape

# Parallèlement, dans le navigateur
# http://localhost:5173/client/demandes
# Rafraîchir après chaque étape pour voir les changements
```

### **Pour tester finement:**

```bash
# Terminal Backend
cd laboratoire-backend
python test_actions_admin.py
# Utilisez le menu pour contrôler chaque action

# Dans le navigateur
# Rafraîchir et vérifier l'UI après chaque action
```

---

## 📝 NOTES IMPORTANTES

### Ordre des étapes

Les scripts vérifient automatiquement l'ordre:

```python
EN_ATTENTE_ECHANTILLONS → confirmer_reception() ✅
AUTRE_STATUT → confirmer_reception() ❌ Erreur

ECHANTILLONS_RECUS → demarrer_analyse() ✅
AUTRE_STATUT → demarrer_analyse() ❌ Erreur

EN_COURS → terminer_analyse() ✅
AUTRE_STATUT → terminer_analyse() ❌ Erreur
```

### Réinitialisation

Pour refaire un test, il faut:
1. Créer une nouvelle demande
2. Admin valide
3. Client accepte
4. Relancer les scripts

---

## 🐛 DÉPANNAGE

### "Aucune demande trouvée"

**Cause:** Pas de demande en EN_ATTENTE_ECHANTILLONS

**Solution:**
```bash
# Créer et accepter une demande via l'interface web
# OU
python manage.py shell
>>> from facturation.models import DemandeAnalyse
>>> DemandeAnalyse.objects.filter(statut='EN_ATTENTE_ECHANTILLONS')
```

### "Statut actuel incompatible"

**Cause:** Mauvais ordre des étapes

**Solution:** Vérifier le statut actuel et exécuter la bonne action.

```bash
python test_actions_admin.py details DAN-2025-0001
```

---

## ✅ CHECKLIST FINALE

Après avoir testé tout le workflow:

- [ ] Proforma créée automatiquement (BROUILLON)
- [ ] Admin a validé (VALIDEE)
- [ ] Client a accepté (ACCEPTEE)
- [ ] DemandeAnalyse créée automatiquement
- [ ] Échantillons confirmés (ECHANTILLONS_RECUS)
- [ ] Analyse démarrée (EN_COURS)
- [ ] Analyse terminée (TERMINEE)
- [ ] Paiement enregistré (RESULTATS_ENVOYES)
- [ ] Interface client affiche correctement toutes les phases
- [ ] Badges PHASE 1 et PHASE 2 fonctionnent
- [ ] Messages et instructions clairs à chaque étape
- [ ] Chronologie complète enregistrée

---

## 🎉 SUCCÈS

Si tous les tests passent:

✅ **Workflow complet opérationnel de bout en bout!**

**Vous pouvez maintenant:**
- Déployer en production
- Former les utilisateurs
- Gérer les vraies demandes

---

**📧 Support:** Si problème, vérifier les logs Django et console navigateur.
