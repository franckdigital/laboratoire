# 🚀 Installation Rapide - Module Stock & Application Mobile

## ✅ Ce qui a été fait

### 1. Backend Django - Module Stock
- ✅ **8 nouveaux modèles** créés (Entrepot, Emplacement, Lot, Alerte, Quarantaine, TransfertInterne, Reception, LigneReception)
- ✅ **Modèles mis à jour** (Article, CategorieArticle) avec nouveaux champs ISO 17025
- ✅ **Génération automatique de QR Codes** pour tous les objets
- ✅ **Dépendances ajoutées** (qrcode, Pillow) dans requirements.txt

### 2. Application Mobile React Native
- ✅ **Projet "lab-manager"** créé avec Expo
- ✅ **6 écrans** implémentés :
  - 🔐 LoginScreen (authentification)
  - 📊 DashboardScreen (statistiques)
  - 📷 ScannerScreen (scan QR Code)
  - 📋 InventaireScreen (inventaires)
  - 📦 ReceptionScreen (réceptions)
  - 🔔 AlertesScreen (alertes)
  - 👤 ProfileScreen (profil)
- ✅ **Navigation** complète avec onglets
- ✅ **Authentification** JWT avec contexte React
- ✅ **Service API** complet configuré
- ✅ **Thème** aux couleurs LANEMA

## 📋 Prochaines étapes

### Étape 1 : Backend Django (30 min)

```bash
# 1. Activer l'environnement virtuel
cd laboratoire-backend

# 2. Installer les nouvelles dépendances
pip install -r requirements.txt

# 3. Créer et appliquer les migrations
python manage.py makemigrations stock
python manage.py migrate

# 4. Démarrer le serveur (accessible sur le réseau local)
python manage.py runserver 0.0.0.0:8000
```

**⚠️ Important** : Notez l'adresse IP de votre machine pour la configuration mobile.

### Étape 2 : Application Mobile (15 min)

**Autoriser l'exécution de scripts PowerShell** (une seule fois) :
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Installer et lancer** :
```powershell
cd lab-manager

# Installer les dépendances
npm install

# Configurer l'URL de l'API
# Ouvrir src/services/api.ts et remplacer l'IP par celle de votre machine
# Exemple: const API_BASE_URL = 'http://192.168.1.100:8000/api';

# Démarrer l'application
npm start
```

### Étape 3 : Tester l'application (10 min)

1. **Installer Expo Go** sur votre téléphone :
   - Android : [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - iOS : [App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **Scanner le QR Code** affiché dans le terminal

3. **Se connecter** avec vos identifiants Django

4. **Tester les fonctionnalités** :
   - ✅ Dashboard
   - ✅ Scanner (nécessite des QR Codes générés)
   - ✅ Alertes
   - ✅ Profil

## 🔧 Configuration avancée (Backend)

### Créer les serializers et viewsets

Les modèles Django sont prêts, mais vous devez créer :

1. **Serializers** dans `stock/serializers.py` :
   - `EntrepotSerializer`
   - `EmplacementSerializer`
   - `LotSerializer`
   - `AlerteSerializer`
   - `QuarantaineSerializer`
   - `TransfertInterneSerializer`
   - `ReceptionSerializer`
   - `LigneReceptionSerializer`

2. **ViewSets** dans `stock/views.py` :
   - Actions CRUD standards
   - Actions personnalisées (scan, marquer_ouvert, lever_quarantaine, etc.)

3. **URLs** dans `stock/urls.py` :
   - Enregistrer tous les viewsets dans le router

### Exemple de ViewSet minimal

```python
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

class LotViewSet(viewsets.ModelViewSet):
    queryset = Lot.objects.all()
    serializer_class = LotSerializer
    
    @action(detail=False, methods=['post'])
    def scan(self, request):
        """Scan d'un QR Code de lot"""
        qr_code = request.data.get('qr_code')
        # Extraire l'ID du QR Code et retourner le lot
        # Format: "LOT:uuid|NUM:numero_lot|ART:ref_article"
        try:
            lot_id = qr_code.split('LOT:')[1].split('|')[0]
            lot = Lot.objects.get(id=lot_id)
            return Response(LotSerializer(lot).data)
        except:
            return Response({'error': 'Lot non trouvé'}, status=404)
    
    @action(detail=True, methods=['post'])
    def marquer_ouvert(self, request, pk=None):
        """Marque un lot comme ouvert"""
        lot = self.get_object()
        lot.marquer_comme_ouvert()
        return Response(LotSerializer(lot).data)
```

## 📱 Trouver l'adresse IP de votre machine

### Windows (PowerShell)
```powershell
ipconfig
```
Cherchez "Adresse IPv4" sous votre adaptateur réseau actif.

### Tester l'accès
Ouvrez dans un navigateur sur votre téléphone :
```
http://[VOTRE_IP]:8000/api/
```

## 🐛 Résolution de problèmes

### "Cannot connect to backend"
- ✅ Vérifier que Django tourne sur `0.0.0.0:8000`
- ✅ Vérifier que l'IP dans `api.ts` est correcte
- ✅ Téléphone et PC sur le même WiFi
- ✅ Firewall Windows autorise le port 8000

### "Camera permission denied"
- ✅ Autoriser l'accès caméra dans les paramètres du téléphone
- ✅ Redémarrer l'application Expo

### Les erreurs TypeScript avant npm install
- ⚠️ C'est normal ! Elles disparaîtront après `npm install`

## 📚 Documentation complète

- **Module Stock** : Voir `STOCK_MODULE_UPDATE.md`
- **Application Mobile** : Voir `lab-manager/README.md`
- **API Backend** : http://localhost:8000/api/docs/ (après démarrage)

## 🎯 Fonctionnalités prioritaires à implémenter

### Backend (Ordre de priorité)
1. ✅ Modèles créés
2. ⏳ Serializers et ViewSets
3. ⏳ Permissions par rôle
4. ⏳ Tâches automatiques d'alertes
5. ⏳ Génération des QR Codes pour les données existantes

### Mobile (Ordre de priorité)
1. ✅ Structure de base
2. ⏳ Tests sur appareils réels
3. ⏳ Gestion hors ligne
4. ⏳ Notifications push
5. ⏳ Build production

## 💡 Conseils

### Pour le développement
- Gardez Django et Expo ouverts en même temps
- Utilisez le hot-reload (les changements s'appliquent automatiquement)
- Consultez les logs dans le terminal Expo pour débugger

### Pour la production
- Configurez HTTPS pour le backend
- Utilisez des variables d'environnement pour les URLs
- Activez les notifications push avec Firebase
- Testez sur plusieurs appareils Android/iOS

## ✨ Résultat attendu

Après ces étapes, vous aurez :
- ✅ Backend Django avec gestion de stock complète ISO 17025
- ✅ Application mobile fonctionnelle
- ✅ Scanner QR Code opérationnel
- ✅ Système d'alertes
- ✅ Traçabilité complète des lots

## 📞 Support

- **Documentation** : Voir les fichiers README.md
- **Problèmes connus** : Vérifier les sections "Dépannage"
- **Questions** : support@lanema.cm

---

**Temps estimé total** : 1 heure  
**Niveau de difficulté** : Intermédiaire  
**Prérequis** : Django fonctionnel, Node.js installé

**Bon développement ! 🚀**
