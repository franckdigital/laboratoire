# Lab Manager - Application Mobile de Gestion de Stock

Application mobile React Native (Expo) pour la gestion de stock du laboratoire LANEMA, conforme ISO 17025.

## 📱 Fonctionnalités

- **Authentification sécurisée** avec JWT
- **Scanner QR Code** pour articles, lots et emplacements
- **Dashboard** avec statistiques et alertes en temps réel
- **Inventaire mobile** avec scan et validation
- **Réception de produits** avec vérification qualité
- **Alertes** pour stock critique et péremptions
- **Mode offline** (à venir)

## 🚀 Installation

### Prérequis

- Node.js 18+ 
- npm ou yarn
- Expo CLI (sera installé automatiquement)
- Un appareil mobile ou émulateur

### Étapes d'installation

1. **Naviguer dans le dossier du projet**
```powershell
cd "c:\Users\ACER ASPIRE V NITRO\Desktop\laboratoire\lab-manager"
```

2. **Installer les dépendances**
```powershell
npm install
```

3. **Configurer l'URL de l'API**

Ouvrir `src/services/api.ts` et modifier l'URL du serveur backend :
```typescript
const API_BASE_URL = 'http://192.168.1.100:8000/api'; // Remplacez par l'IP de votre serveur
```

⚠️ **Important**: 
- Pour Android: Utilisez l'adresse IP locale de votre machine (pas localhost)
- Pour iOS: Utilisez l'adresse IP locale de votre machine
- Assurez-vous que le backend Django est démarré et accessible

## 📲 Lancement de l'application

### Démarrer le serveur de développement

```powershell
npm start
```

ou

```powershell
npx expo start
```

### Options de lancement

Après le démarrage, vous verrez un QR code et plusieurs options :

- **Appuyez sur `a`** : Ouvrir sur émulateur Android
- **Appuyez sur `i`** : Ouvrir sur simulateur iOS
- **Scanner le QR code** : Ouvrir sur votre téléphone avec l'app Expo Go

### Utiliser Expo Go

1. Téléchargez l'application **Expo Go** depuis :
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) (Android)
   - [App Store](https://apps.apple.com/app/expo-go/id982107779) (iOS)

2. Ouvrez Expo Go sur votre téléphone

3. Scannez le QR code affiché dans votre terminal

4. L'application se lancera automatiquement

## 🔧 Configuration backend requise

### Backend Django doit être configuré

1. **Installer les nouvelles dépendances**
```bash
pip install qrcode[pil] Pillow
```

2. **Créer les migrations pour les nouveaux modèles**
```bash
python manage.py makemigrations stock
python manage.py migrate
```

3. **Créer les serializers et viewsets** pour les nouveaux modèles (Lot, Alerte, Quarantaine, etc.)

4. **Configurer CORS** pour accepter les requêtes depuis le mobile

Dans `settings.py` :
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8081",  # Expo default
    "http://192.168.1.100:8081",  # Votre IP locale
]
```

5. **Démarrer le serveur Django**
```bash
python manage.py runserver 0.0.0.0:8000
```

## 📁 Structure du projet

```
lab-manager/
├── App.tsx                 # Point d'entrée
├── app.json               # Configuration Expo
├── package.json           # Dépendances
├── tsconfig.json         # Configuration TypeScript
├── src/
│   ├── context/
│   │   └── AuthContext.tsx       # Contexte d'authentification
│   ├── navigation/
│   │   └── AppNavigator.tsx      # Navigation principale
│   ├── screens/
│   │   ├── Auth/
│   │   │   └── LoginScreen.tsx   # Écran de connexion
│   │   ├── Dashboard/
│   │   │   └── DashboardScreen.tsx  # Tableau de bord
│   │   ├── Scanner/
│   │   │   └── ScannerScreen.tsx    # Scanner QR Code
│   │   ├── Inventaire/
│   │   │   └── InventaireScreen.tsx # Inventaires
│   │   ├── Reception/
│   │   │   └── ReceptionScreen.tsx  # Réceptions
│   │   ├── Alertes/
│   │   │   └── AlertesScreen.tsx    # Alertes
│   │   └── Profile/
│   │       └── ProfileScreen.tsx    # Profil utilisateur
│   ├── services/
│   │   └── api.ts              # Service API
│   └── theme/
│       └── theme.ts           # Thème de l'application
```

## 🎨 Thème et Design

L'application utilise **React Native Paper** avec un thème personnalisé aux couleurs de LANEMA :
- Couleur primaire : `#006bb3`
- Design moderne et épuré
- Interface intuitive et accessible

## 📋 Utilisation

### Connexion

1. Lancez l'application
2. Entrez vos identifiants (email et mot de passe)
3. Appuyez sur "Se connecter"

### Scanner un QR Code

1. Accédez à l'onglet "Scanner"
2. Autorisez l'accès à la caméra si demandé
3. Pointez la caméra vers le QR code
4. Les informations s'affichent automatiquement

### Consulter les alertes

1. Accédez à l'onglet "Alertes"
2. Visualisez les alertes actives par priorité
3. Appuyez sur une alerte pour plus de détails
4. Marquez-la comme traitée si nécessaire

## 🔐 Sécurité

- Authentification JWT avec tokens sécurisés
- Stockage sécurisé des tokens (AsyncStorage)
- Expiration automatique des sessions
- Permissions caméra demandées explicitement

## 🛠️ Technologies utilisées

- **React Native** avec **Expo**
- **TypeScript** pour le typage
- **React Navigation** pour la navigation
- **React Native Paper** pour l'UI
- **Expo Camera** pour le scanner QR Code
- **Axios** pour les requêtes API
- **AsyncStorage** pour le stockage local

## 📱 Permissions requises

### Android
- Caméra (pour le scanner QR Code)
- Stockage (pour les documents)

### iOS
- Caméra (pour le scanner QR Code)

## 🐛 Dépannage

### L'application ne se connecte pas au backend

1. Vérifiez que le backend Django est démarré
2. Vérifiez l'URL dans `src/services/api.ts`
3. Vérifiez que votre téléphone et votre PC sont sur le même réseau WiFi
4. Testez l'URL dans un navigateur mobile : `http://[IP]:8000/api/`

### Le scanner ne fonctionne pas

1. Vérifiez que les permissions caméra sont accordées
2. Redémarrez l'application
3. Sur Android, vérifiez les permissions dans les paramètres système

### Erreurs TypeScript dans l'IDE

Les erreurs TypeScript avant l'installation des dépendances sont normales. Exécutez `npm install` pour les résoudre.

## 📦 Build pour production

### Android (APK)

```bash
eas build --platform android
```

### iOS (IPA)

```bash
eas build --platform ios
```

Note: Nécessite un compte Expo et configuration EAS Build.

## 🔄 Mises à jour

Pour mettre à jour les dépendances :

```bash
npm update
```

Pour mettre à jour Expo SDK :

```bash
npx expo upgrade
```

## 📞 Support

Pour toute question ou problème :
- Email : support@lanema.cm
- Documentation API : http://localhost:8000/api/docs/

## 📄 Licence

© 2025 LANEMA - Tous droits réservés

---

**Version** : 1.0.0  
**Dernière mise à jour** : Janvier 2025
