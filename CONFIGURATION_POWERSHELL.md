# 🔧 Configuration PowerShell pour l'installation mobile

## Problème
Windows bloque l'exécution de scripts PowerShell par défaut, empêchant `npm` et `npx` de fonctionner.

## ✅ Solution (2 méthodes)

### Méthode 1 : Autoriser pour l'utilisateur actuel (Recommandé)

**Ouvrir PowerShell en tant qu'Administrateur** (clic droit → "Exécuter en tant qu'administrateur") :

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Confirmez en tapant **Y** (Oui).

### Méthode 2 : Utiliser CMD au lieu de PowerShell

**Ouvrir l'invite de commandes CMD** (pas PowerShell) et exécuter :

```cmd
cd "c:\Users\ACER ASPIRE V NITRO\Desktop\laboratoire\lab-manager"
npm install
```

## 📱 Après la configuration

Une fois PowerShell configuré ou en utilisant CMD, installez les dépendances :

### 1. Installer les dépendances
```bash
cd "c:\Users\ACER ASPIRE V NITRO\Desktop\laboratoire\lab-manager"
npm install
```

Cette commande va installer :
- React Native et Expo
- React Navigation
- React Native Paper
- Toutes les dépendances nécessaires

**⏱️ Durée estimée** : 5-10 minutes (selon votre connexion internet)

### 2. Configurer l'URL de l'API

Après l'installation, ouvrez le fichier :
```
lab-manager\src\services\api.ts
```

Et modifiez la ligne 13 avec l'adresse IP de votre machine :

**Avant** :
```typescript
const API_BASE_URL = 'http://192.168.1.100:8000/api';
```

**Après** (remplacez par VOTRE IP) :
```typescript
const API_BASE_URL = 'http://192.168.1.XXX:8000/api';  // Votre IP
```

#### 🔍 Comment trouver votre IP ?

Dans PowerShell ou CMD, tapez :
```bash
ipconfig
```

Cherchez "Adresse IPv4" sous "Carte réseau sans fil Wi-Fi" ou "Ethernet".

### 3. Démarrer le serveur Django

**Dans un autre terminal**, démarrez le backend Django :

```bash
cd "c:\Users\ACER ASPIRE V NITRO\Desktop\laboratoire\laboratoire-backend"
python manage.py runserver 0.0.0.0:8000
```

**Important** : Gardez ce terminal ouvert !

### 4. Lancer l'application mobile

**Dans le terminal lab-manager** :

```bash
npm start
```

ou

```bash
npx expo start
```

### 5. Scanner le QR Code

1. **Téléchargez Expo Go** sur votre smartphone :
   - Android : https://play.google.com/store/apps/details?id=host.exp.exponent
   - iOS : https://apps.apple.com/app/expo-go/id982107779

2. **Ouvrez Expo Go**

3. **Scannez le QR Code** affiché dans le terminal

4. **L'application se lance** sur votre téléphone !

## 🧪 Tester l'application

1. **Se connecter** avec vos identifiants Django
2. **Accéder au Dashboard** pour voir les statistiques
3. **Tester le Scanner** (nécessite des QR codes générés côté backend)
4. **Consulter les Alertes**

## ⚠️ Problèmes courants

### "Cannot connect to backend"
- ✅ Vérifiez que Django tourne sur `0.0.0.0:8000`
- ✅ Vérifiez l'IP dans `api.ts`
- ✅ Téléphone et PC sur le même WiFi
- ✅ Firewall Windows autorise le port 8000

### "Metro bundler failed to start"
- ✅ Fermez tous les terminaux
- ✅ Supprimez `node_modules` et relancez `npm install`
- ✅ Redémarrez VS Code

### Permission caméra refusée
- ✅ Autorisez la caméra dans les paramètres Android/iOS
- ✅ Relancez l'application

## 📊 Résultat attendu

Après ces étapes, vous aurez :
- ✅ Application mobile fonctionnelle
- ✅ Connexion au backend Django
- ✅ Scanner QR Code opérationnel
- ✅ Dashboard avec statistiques temps réel
- ✅ Gestion des alertes

## 🆘 Besoin d'aide ?

Si vous rencontrez des problèmes :
1. Vérifiez les logs dans le terminal Expo
2. Vérifiez les logs Django
3. Consultez `INSTALLATION_RAPIDE.md` pour plus de détails

---

**Bon développement ! 🚀**
