# 🚨 MIGRATION BACKEND URGENTE - Types d'Analyse

**Problème:** `Error: « EAUX_CONSOMMATION » n'est pas un choix valide.`  
**Cause:** Backend Django utilise encore les anciens types d'analyse  
**Solution:** Mettre à jour immédiatement le modèle Django

---

## ⚡ ÉTAPE 1: Modifier le modèle (2 min)

### Fichier: `demandes/models.py`

**Trouver cette section:**
```python
TYPE_ANALYSE_CHOICES = [
    ('MECANIQUE', 'Essais mécaniques'),
    ('CHIMIE', 'Analyse chimique'),
    ('GRANULO', 'Analyse granulométrique'),
    # ... anciens choix
]
```

**Remplacer par:**
```python
TYPE_ANALYSE_CHOICES = [
    ('MICROBIOLOGIE_PARASITOLOGIE', 'Microbiologie et parasitologie'),
    ('CHIMIE_ALIMENTAIRE_INDUSTRIELLE', 'Chimie alimentaire et industrielle'),
    ('EAUX_CONSOMMATION', 'Eaux de consommation / Eaux potables'),
    ('SOLS_ENGRAIS', 'Sols et engrais'),
    ('METROLOGIE', 'Analyses de métrologie'),
    ('ETALONNAGE_INSTRUMENTS', 'Étalonnage et vérification d\'instruments'),
    ('ETALONNAGE_VERRERIE', 'Étalonnage de verrerie de laboratoire'),
]
```

**Dans le modèle DemandeDevis:**
```python
class DemandeDevis(models.Model):
    # ... autres champs
    
    type_analyse = models.CharField(
        max_length=50,  # ⚠️ Augmenter si nécessaire (était probablement 20)
        choices=TYPE_ANALYSE_CHOICES
    )
    
    categorie = models.CharField(
        max_length=200,  # ⚠️ Augmenter si nécessaire
        blank=True
    )
```

---

## ⚡ ÉTAPE 2: Créer la migration (1 min)

```bash
cd laboratoire-backend  # Ou votre dossier backend
python manage.py makemigrations demandes
```

**Vous verrez:**
```
Migrations for 'demandes':
  demandes/migrations/0XXX_update_type_analyse.py
    - Alter field type_analyse on demandedevis
```

---

## ⚡ ÉTAPE 3: Appliquer la migration (1 min)

```bash
python manage.py migrate demandes
```

**Vous verrez:**
```
Running migrations:
  Applying demandes.0XXX_update_type_analyse... OK
```

---

## ⚡ ÉTAPE 4: Redémarrer le serveur (30 sec)

```bash
# Arrêter le serveur (Ctrl+C)
# Puis relancer
python manage.py runserver
```

---

## 🧪 ÉTAPE 5: Tester immédiatement

1. Retourner sur `/client/demande-devis`
2. Sélectionner "Eaux de consommation"
3. Remplir le reste du formulaire
4. Soumettre

**Ça devrait maintenant fonctionner!** ✅

---

## ⚠️ ATTENTION: Données Existantes

Si vous avez déjà des demandes avec les anciens types:

### Option A: Migration de données (Recommandé)

Créer une migration de données:

```python
# demandes/migrations/0XXX_migrate_old_types.py
from django.db import migrations

def migrate_types(apps, schema_editor):
    DemandeDevis = apps.get_model('demandes', 'DemandeDevis')
    
    mapping = {
        'MECANIQUE': 'ETALONNAGE_INSTRUMENTS',
        'CHIMIE': 'CHIMIE_ALIMENTAIRE_INDUSTRIELLE',
        'MICROBIOLOGIE': 'MICROBIOLOGIE_PARASITOLOGIE',
        'PHYSIQUE': 'METROLOGIE',
        'ENVIRONNEMENT': 'EAUX_CONSOMMATION',
        'GRANULO': 'SOLS_ENGRAIS',
        'QUALITE': 'CHIMIE_ALIMENTAIRE_INDUSTRIELLE',
        'AUTRE': 'MICROBIOLOGIE_PARASITOLOGIE',  # Défaut
    }
    
    for old_type, new_type in mapping.items():
        DemandeDevis.objects.filter(type_analyse=old_type).update(
            type_analyse=new_type
        )

def reverse_migrate(apps, schema_editor):
    pass  # Optionnel

class Migration(migrations.Migration):
    dependencies = [
        ('demandes', '0XXX_update_type_analyse'),  # Migration précédente
    ]

    operations = [
        migrations.RunPython(migrate_types, reverse_migrate),
    ]
```

### Option B: Garder les anciens types temporairement

Si vous voulez garder compatibilité temporaire:

```python
TYPE_ANALYSE_CHOICES = [
    # Nouveaux types
    ('MICROBIOLOGIE_PARASITOLOGIE', 'Microbiologie et parasitologie'),
    ('CHIMIE_ALIMENTAIRE_INDUSTRIELLE', 'Chimie alimentaire et industrielle'),
    ('EAUX_CONSOMMATION', 'Eaux de consommation / Eaux potables'),
    ('SOLS_ENGRAIS', 'Sols et engrais'),
    ('METROLOGIE', 'Analyses de métrologie'),
    ('ETALONNAGE_INSTRUMENTS', 'Étalonnage et vérification d\'instruments'),
    ('ETALONNAGE_VERRERIE', 'Étalonnage de verrerie de laboratoire'),
    
    # Anciens types (DEPRECATED - à supprimer plus tard)
    ('MECANIQUE', '[ANCIEN] Essais mécaniques'),
    ('CHIMIE', '[ANCIEN] Analyse chimique'),
    ('GRANULO', '[ANCIEN] Analyse granulométrique'),
    ('PHYSIQUE', '[ANCIEN] Essais physiques'),
    ('ENVIRONNEMENT', '[ANCIEN] Analyse environnementale'),
    ('MICROBIOLOGIE', '[ANCIEN] Analyse microbiologique'),
    ('QUALITE', '[ANCIEN] Contrôle qualité'),
    ('AUTRE', '[ANCIEN] Autre'),
]
```

---

## 🔍 VÉRIFICATION

### Test Backend Direct

```bash
python manage.py shell
```

```python
from demandes.models import DemandeDevis

# Vérifier les choix disponibles
print(DemandeDevis._meta.get_field('type_analyse').choices)

# Devrait afficher:
# [('MICROBIOLOGIE_PARASITOLOGIE', 'Microbiologie et parasitologie'), ...]
```

### Test API

```bash
curl -X POST http://localhost:8000/api/demandes/devis/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type_analyse": "EAUX_CONSOMMATION",
    "categorie": "Eau potable du robinet",
    "priorite": "NORMALE",
    "description": "Test",
    "echantillons": [
      {"designation": "Test", "quantite": 1, "unite": "L"}
    ]
  }'
```

**Si succès:** `HTTP 201 Created` ✅  
**Si erreur:** Vérifier les étapes précédentes ❌

---

## 📝 CHECKLIST COMPLÈTE

- [ ] Modifier `TYPE_ANALYSE_CHOICES` dans `demandes/models.py`
- [ ] Augmenter `max_length` si nécessaire (type_analyse et categorie)
- [ ] Créer migration: `python manage.py makemigrations`
- [ ] Appliquer migration: `python manage.py migrate`
- [ ] (Optionnel) Migration des données existantes
- [ ] Redémarrer serveur Django
- [ ] Tester création demande depuis frontend
- [ ] Vérifier que l'erreur a disparu

---

## 🎯 APRÈS LA MIGRATION

Une fois que tout fonctionne:

1. ✅ Frontend envoie nouveaux types → Backend les accepte
2. ✅ Demande créée avec succès
3. ⏳ Implémenter génération proforma (voir FACTURE_PROFORMA_IMPLEMENTATION.md)

---

## 🆘 PROBLÈMES COURANTS

### Erreur: `max_length too small`
**Solution:** Augmenter `max_length=50` pour `type_analyse`

### Erreur: `Migration conflicts`
**Solution:** 
```bash
python manage.py makemigrations --merge
python manage.py migrate
```

### Erreur: `Existing data violates constraint`
**Solution:** Option B ci-dessus (garder anciens types temporairement)

---

## ⏱️ TEMPS ESTIMÉ

- Modification code: **2 min**
- Migration: **1 min**
- Redémarrage: **30 sec**
- Tests: **2 min**

**TOTAL: ~6 minutes** ⚡

---

**URGENT: Faites ces changements maintenant pour débloquer le frontend!** 🚀
