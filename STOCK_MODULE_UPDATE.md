# Mise à jour complète du module de gestion de stock

## 📋 Vue d'ensemble

Ce document décrit les mises à jour apportées au module de gestion de stock pour répondre aux exigences ISO 17025 et aux besoins de traçabilité avancée du laboratoire LANEMA.

## 🆕 Nouveaux modèles Django

### 1. Entrepot
Gestion des entrepôts de stockage avec :
- Types (magasin principal, chambre froide, salle réactifs, etc.)
- Conditions environnementales (température, humidité)
- Localisation et surface
- Responsable
- QR Code automatique

### 2. Emplacement
Gestion détaillée des emplacements dans les entrepôts :
- Code unique par entrepôt
- Organisation hiérarchique (allée/rayon/étagère/bac)
- Capacité maximale et utilisée
- QR Code automatique

### 3. Lot
Traçabilité complète des lots pour ISO 17025 :
- Numéro de lot unique
- Dates (fabrication, péremption, réception, ouverture)
- Gestion de la validité après ouverture
- Quantités (initiale/restante)
- Documents (certificat d'analyse, bon de livraison)
- Statuts (ACTIF, OUVERT, EXPIRE, QUARANTAINE, EPUISE, DETRUIT)
- QR Code automatique
- Méthodes : `est_expire`, `expire_apres_ouverture`, `marquer_comme_ouvert()`

### 4. Alerte
Système d'alertes intelligent :
- Types : stock critique, rupture, péremptions (60j/30j/7j), expiration, consommation anormale
- Niveaux de priorité (INFO, AVERTISSEMENT, CRITIQUE, URGENT)
- Notifications (email, SMS, push)
- Traçabilité du traitement
- Méthode : `marquer_traitee(user, commentaire)`

### 5. Quarantaine
Gestion des lots non conformes :
- Numéro unique auto-généré (QUAR-YYYY-XXXX)
- Motifs détaillés
- Workflow complet (mise en quarantaine → décision → levée)
- Signature électronique
- Documents (rapport de non-conformité)
- Méthode : `lever_quarantaine(user, decision, commentaire)`

### 6. TransfertInterne
Traçabilité des mouvements entre emplacements :
- Numéro unique auto-généré (TRF-YYYYMMDD-XXXX)
- Origine et destination
- Workflow (brouillon → validation → exécution)
- Personnel impliqué (demandeur, validateur, exécutant)

### 7. Reception
Réceptions de produits avec bon de réception :
- Numéro unique auto-généré (REC-YYYYMMDD-XXXX)
- Fournisseur et références commande
- Vérification de conformité
- Scan du bon de livraison
- Statuts (EN_COURS, VERIFIEE, VALIDEE, REJETEE)

### 8. LigneReception
Détail des lignes de réception :
- Quantités attendues vs reçues
- Informations du lot (numéro, dates)
- Vérification de conformité
- Création automatique du lot si conforme

## 🔄 Modèles mis à jour

### Article
**Nouveaux champs** :
- `entrepot_defaut` : Entrepôt par défaut
- `emplacement_defaut` : Emplacement par défaut
- `temperature_conservation` : Conditions de stockage (AMBIENT, FRAIS, CONGELATEUR, ULTRA_FROID, SPECIAL)
- `duree_validite_apres_ouverture_jours` : Durée de validité après ouverture
- `classe_danger` : Classification SGH (SGH01 à SGH09)
- `classes_danger_secondaires` : Classes supplémentaires
- `phrases_h` : Mentions de danger H
- `phrases_p` : Conseils de prudence P
- `nom_fabricant` : Fabricant du produit
- `certificat_analyse` : Certificat d'analyse
- `certificat_etalonnage` : Certificat d'étalonnage
- `manuel_utilisateur` : Manuel d'utilisation
- `qr_code` : QR Code de l'article

**Nouveau type** :
- `ETALON` : Étalons et solutions de référence

**Méthode** :
- `generate_qr_code()` : Génération automatique du QR Code

### CategorieArticle
**Nouveau domaine** :
- `ETALON` : Catégorie pour les étalons

## 🔧 Configuration requise

### 1. Installation des dépendances Python

```bash
pip install qrcode[pil]==7.4.2 Pillow==10.1.0
```

Ces dépendances sont déjà ajoutées dans `requirements.txt`.

### 2. Migrations Django

```bash
python manage.py makemigrations stock
python manage.py migrate
```

### 3. Génération des QR Codes

Les QR Codes sont générés automatiquement lors de la création des entités. Pour générer les QR Codes des entités existantes :

```python
from stock.models import Article, Lot, Entrepot, Emplacement

# Générer les QR Codes pour tous les articles
for article in Article.objects.all():
    article.generate_qr_code()
    article.save()

# Idem pour les autres modèles
```

## 📊 Fonctionnalités principales

### 1. Traçabilité ISO 17025
- Gestion complète des lots avec certificats
- Historique complet des mouvements
- Signatures électroniques
- Documents attachés (FDS, certificats, manuels)

### 2. Système d'alertes automatique
- Alertes de stock (critique, minimum, rupture)
- Alertes de péremption (60j, 30j, 7j, expiré)
- Alertes d'ouverture (bientôt expiré, expiré après ouverture)
- Alertes de quarantaine
- Alertes de consommation anormale

### 3. Gestion de la quarantaine
- Mise en quarantaine avec motif
- Workflow de validation
- Décisions tracées (approbation, refus, retour fournisseur)
- Signature électronique

### 4. Réception mobile
- Scan des bons de livraison
- Vérification article par article
- Création automatique des lots
- Validation qualité

### 5. Inventaire mobile
- Scan QR Code des articles/lots/emplacements
- Comptage en temps réel
- Écarts automatiques
- Corrections tracées

### 6. QR Codes
Génération automatique pour :
- Articles (REF + NOM)
- Lots (NUM + ARTICLE + DATE PEREMPTION)
- Entrepôts (ID)
- Emplacements (ID)

## 🔗 Intégration avec l'application mobile

L'application mobile **lab-manager** utilise ces modèles via l'API REST :

### Endpoints API à créer

```python
# stock/urls.py
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'entrepots', EntrepotViewSet)
router.register(r'emplacements', EmplacementViewSet)
router.register(r'lots', LotViewSet)
router.register(r'alertes', AlerteViewSet)
router.register(r'quarantaines', QuarantaineViewSet)
router.register(r'transferts', TransfertInterneViewSet)
router.register(r'receptions', ReceptionViewSet)
```

### Actions personnalisées nécessaires

```python
# Dans LotViewSet
@action(detail=True, methods=['post'])
def marquer_ouvert(self, request, pk=None):
    """Marque un lot comme ouvert"""
    
@action(detail=False, methods=['post'])
def scan(self, request):
    """Scan d'un QR Code de lot"""

# Dans AlerteViewSet
@action(detail=True, methods=['post'])
def marquer_traitee(self, request, pk=None):
    """Marque une alerte comme traitée"""

# Dans QuarantaineViewSet
@action(detail=True, methods=['post'])
def lever(self, request, pk=None):
    """Lève une quarantaine"""

# Dans TransfertInterneViewSet
@action(detail=True, methods=['post'])
def valider(self, request, pk=None):
    """Valide un transfert"""
    
@action(detail=True, methods=['post'])
def executer(self, request, pk=None):
    """Exécute un transfert"""

# Dans EmplacementViewSet
@action(detail=False, methods=['post'])
def scan(self, request):
    """Scan d'un QR Code d'emplacement"""

# Dans ArticleViewSet
@action(detail=False, methods=['post'])
def scan(self, request):
    """Scan d'un QR Code d'article"""
```

## 📈 Dashboard et statistiques

### Statistiques à implémenter

```python
# Dans DashboardViewSet
@action(detail=False, methods=['get'])
def stats(self, request):
    """Statistiques générales"""
    return Response({
        'total_articles': Article.objects.filter(est_actif=True).count(),
        'alertes_actives': Alerte.objects.filter(statut='ACTIVE').count(),
        'produits_expires': Lot.objects.filter(statut='EXPIRE').count(),
        'stock_critique': Article.objects.filter(quantite_stock__lte=F('seuil_critique')).count(),
        'quarantaines_en_cours': Quarantaine.objects.filter(statut='EN_COURS').count(),
    })

@action(detail=False, methods=['get'])
def alertes_critiques(self, request):
    """Top 10 alertes critiques"""
    alertes = Alerte.objects.filter(
        statut='ACTIVE',
        niveau_priorite__in=['CRITIQUE', 'URGENT']
    ).order_by('-date_creation')[:10]
    return Response(AlerteSerializer(alertes, many=True).data)
```

## 🎯 Prochaines étapes

### 1. Backend
- [ ] Créer les serializers pour tous les nouveaux modèles
- [ ] Créer les viewsets avec actions personnalisées
- [ ] Configurer les URLs
- [ ] Ajouter les permissions par rôle
- [ ] Créer les tâches Celery pour les alertes automatiques
- [ ] Implémenter l'envoi d'emails/SMS pour les alertes

### 2. Frontend Web
- [ ] Créer les pages de gestion des entrepôts
- [ ] Créer les pages de gestion des emplacements
- [ ] Créer les pages de gestion des lots
- [ ] Créer le tableau de bord des alertes
- [ ] Créer l'interface de quarantaine
- [ ] Ajouter la visualisation des QR Codes

### 3. Application Mobile
- [x] Configuration du projet React Native
- [x] Écrans principaux (Dashboard, Scanner, etc.)
- [x] Intégration API
- [ ] Tests sur appareils réels
- [ ] Build APK/IPA

### 4. Tests et documentation
- [ ] Tests unitaires pour les modèles
- [ ] Tests d'intégration pour l'API
- [ ] Documentation utilisateur
- [ ] Formations utilisateurs

## 🔐 Sécurité et conformité

### ISO 17025
- ✅ Traçabilité complète des lots
- ✅ Certificats d'analyse attachés
- ✅ Signatures électroniques
- ✅ Gestion de la quarantaine
- ✅ Historique complet des mouvements

### Permissions par rôle
À implémenter dans les ViewSets :
- **ADMIN** : Tous les droits
- **GESTIONNAIRE_STOCK** : Gestion complète du stock
- **RESPONSABLE_QUALITE** : Gestion des quarantaines et validation
- **TECHNICIEN** : Réception, inventaire, consultation
- **UTILISATEUR** : Consultation uniquement

## 📞 Support

Pour toute question technique :
- Email : support@lanema.cm
- Documentation : http://localhost:8000/api/docs/

---

**Date de mise à jour** : Janvier 2025  
**Version module stock** : 2.0.0  
**Conformité** : ISO/IEC 17025:2017
