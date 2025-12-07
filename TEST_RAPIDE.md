# 🚀 TEST RAPIDE - 2 MINUTES

## LANCEMENT ULTRA-RAPIDE

### 1️⃣ Serveurs en marche

```bash
# Terminal 1
cd laboratoire-backend
python manage.py runserver

# Terminal 2
cd laboratoire-public
npm run dev
```

---

### 2️⃣ Créer une demande (Interface Web)

```
1. http://localhost:5173/login
2. Se connecter CLIENT
3. "Mes demandes" → "+ Nouvelle demande"
4. Remplir et soumettre
5. Voir "PHASE 1 - PRÉ-ENGAGEMENT" ✅
```

---

### 3️⃣ Admin valide (Interface Web)

```
1. Se connecter ADMIN
2. "Administration" → "Proformas"
3. Cliquer "Valider" sur le BROUILLON
4. Client voit "PHASE 1 - DÉCISION CLIENT" ✅
```

---

### 4️⃣ Client accepte (Interface Web)

```
1. Se reconnecter CLIENT
2. "Mes demandes"
3. Cliquer "✅ Accepter ce devis"
4. Voir "PHASE 2 - ENGAGEMENT" ✅
5. Instructions dépôt affichées ✅
```

---

### 5️⃣ Simuler le reste (Terminal Backend)

```bash
# Terminal 3 (nouveau)
cd laboratoire-backend
python test_workflow_complet.py
```

**Appuyez sur Entrée à chaque pause.**

---

## 🎬 RÉSULTAT ATTENDU

### Interface client se met à jour:

```
✅ EN_ATTENTE_ECHANTILLONS → Instructions dépôt
✅ ECHANTILLONS_RECUS → Confirmation
✅ EN_COURS → Analyses en cours
✅ TERMINEE → Résultats disponibles
✅ RESULTATS_ENVOYES → Téléchargement actif
```

### Terminal affiche:

```
📦 ÉTAPE 6: Confirmation réception échantillons
✅ Échantillons confirmés!

🔬 ÉTAPE 7.1: Démarrage de l'analyse
✅ Analyse démarrée!

🧪 ÉTAPE 7.2: Analyses en cours
🔬 Toutes les analyses terminées!

✅ ÉTAPE 7.3: Finalisation de l'analyse
✅ Analyse terminée!

📄 ÉTAPE 8: Résultats disponibles
✅ Facture générée

💳 ÉTAPE 9: Paiement
✅ Paiement reçu

📊 RÉCAPITULATIF COMPLET DU WORKFLOW
✅ SIMULATION TERMINÉE AVEC SUCCÈS!
```

---

## 🎯 ALTERNATIVE: Menu Interactif

```bash
cd laboratoire-backend
python test_actions_admin.py

# Menu:
# 1. Lister demandes
# 2. Confirmer échantillons
# 3. Démarrer analyse
# 4. Terminer analyse
# 5. Enregistrer paiement
```

**Contrôle total, étape par étape.**

---

## 🔍 VÉRIFICATION

### Après simulation, vérifier:

```
✅ http://localhost:5173/client/demandes
   → Statut RESULTATS_ENVOYES
   → Boutons téléchargement actifs
   → Toutes les étapes visibles

✅ http://localhost:5173/app/admin/analyses
   → Timeline complète
   → Statistiques à jour
```

---

## ⚡ ONE-LINER COMPLET

Si tout est déjà configuré et une demande acceptée existe:

```bash
cd laboratoire-backend && python test_workflow_complet.py
```

Appuyez sur Entrée 5 fois → Workflow complet simulé en 30 secondes! 🎉

---

## 📖 GUIDE COMPLET

Pour plus de détails: **GUIDE_TEST_WORKFLOW.md**

---

## 🎊 ENJOY!

**Workflow fonctionnel de A à Z!**
