# Génération des Assets pour Lab Manager

## 📱 Assets requis

L'application nécessite les assets suivants dans le dossier `assets/` :

### 1. Icon (icon.png)
- **Taille** : 1024x1024 px
- **Format** : PNG avec transparence
- **Usage** : Icône principale de l'application

### 2. Adaptive Icon (adaptive-icon.png)
- **Taille** : 1024x1024 px
- **Format** : PNG avec transparence
- **Usage** : Icône adaptative Android

### 3. Splash Screen (splash.png)
- **Taille** : 1242x2436 px (recommandé)
- **Format** : PNG
- **Usage** : Écran de démarrage
- **Couleur de fond** : #006bb3 (bleu LANEMA)

### 4. Favicon (favicon.png)
- **Taille** : 48x48 px
- **Format** : PNG
- **Usage** : Version web

## 🎨 Guide de design

### Couleurs LANEMA
- **Primaire** : #006bb3 (Bleu)
- **Secondaire** : #0084e0 (Bleu clair)
- **Accent** : #00a0e3 (Cyan)
- **Fond** : #F8F9FA (Gris très clair)

### Éléments suggérés pour l'icône
- Logo LANEMA
- Symbole de laboratoire (fiole, microscope)
- QR Code stylisé
- Palette de couleurs bleue

## 🛠️ Création rapide des assets

### Option 1 : Générateur en ligne
1. Créez une icône 1024x1024 avec :
   - [Canva](https://www.canva.com)
   - [Figma](https://www.figma.com)
   - [Adobe Express](https://www.adobe.com/express/)

2. Placez l'icône créée dans `assets/icon.png`

3. Utilisez le même fichier pour :
   - `assets/adaptive-icon.png`
   - `assets/favicon.png` (redimensionnée)

### Option 2 : Générateur d'assets Expo (Recommandé)
Si vous avez une seule icône 1024x1024, Expo peut générer tous les formats automatiquement.

```bash
# Installer eas-cli
npm install -g eas-cli

# Générer les assets
npx expo-cli export:web
```

### Option 3 : Assets temporaires (Pour tester rapidement)
Créez des fichiers PNG simples de couleur unie :

**Windows PowerShell** :
```powershell
# Créer le dossier assets
New-Item -Path "assets" -ItemType Directory -Force

# Note: Vous devrez créer manuellement des fichiers PNG
# ou télécharger des placeholders depuis https://placeholder.com
```

## 📥 Télécharger des placeholders

En attendant les vrais assets, téléchargez des placeholders :

1. **Icon (1024x1024)** :
   ```
   https://via.placeholder.com/1024x1024/006bb3/ffffff?text=Lab+Manager
   ```

2. **Splash (1242x2436)** :
   ```
   https://via.placeholder.com/1242x2436/006bb3/ffffff?text=LANEMA
   ```

3. Sauvegardez ces images dans le dossier `assets/` avec les bons noms.

## 🚀 Sans assets (Temporaire)

L'application peut fonctionner sans assets. Expo utilisera des icônes par défaut.
Les erreurs d'assets n'empêchent pas l'application de démarrer.

## ✅ Vérification

Après avoir ajouté les assets, la structure devrait être :

```
lab-manager/
├── assets/
│   ├── icon.png           (1024x1024)
│   ├── adaptive-icon.png  (1024x1024)
│   ├── splash.png         (1242x2436)
│   └── favicon.png        (48x48)
├── src/
├── App.tsx
└── package.json
```

## 🎯 Assets de production

Pour la version finale, demandez au département marketing de LANEMA :
- Logo officiel en haute résolution
- Charte graphique
- Couleurs officielles
- Guidelines d'identité visuelle

---

**Note** : Les assets sont optionnels pour le développement mais obligatoires pour le build de production (APK/IPA).
