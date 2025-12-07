# 🚀 DÉMARRAGE RAPIDE - 5 ÉTAPES

## ✅ Tout est prêt ! Il ne reste que quelques commandes à exécuter.

---

## 📋 CHECKLIST AVANT DE COMMENCER

- [ ] Python installé
- [ ] Node.js installé
- [ ] Smartphone avec WiFi
- [ ] PC et smartphone sur le même réseau WiFi

---

## 🎯 ÉTAPE 1 : Configurer PowerShell (UNE SEULE FOIS)

### Option A (Recommandé)
**Ouvrir PowerShell en Administrateur** → Exécuter :
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
Tapez **Y** pour confirmer.

### Option B
Utiliser **CMD** au lieu de PowerShell pour toutes les commandes.

---

## 🎯 ÉTAPE 2 : Démarrer le Backend Django

### Méthode rapide (Double-clic)
📂 Double-cliquez sur : `DEMARRAGE_RAPIDE.bat`

### Méthode manuelle
```bash
cd "c:\Users\ACER ASPIRE V NITRO\Desktop\laboratoire\laboratoire-backend"
python manage.py runserver 0.0.0.0:8000
```

**✅ Résultat attendu** :
```
Starting development server at http://0.0.0.0:8000/
```

**⚠️ GARDEZ CETTE FENÊTRE OUVERTE !**

---

## 🎯 ÉTAPE 3 : Trouver votre adresse IP

Dans un **nouveau terminal** :
```bash
ipconfig
```

**Cherchez** : "Adresse IPv4" → Ex: `192.168.1.105`

**Notez cette IP !** Vous en aurez besoin.

---

## 🎯 ÉTAPE 4 : Configurer l'application mobile

### A. Installer les dépendances (première fois seulement)

```bash
cd "c:\Users\ACER ASPIRE V NITRO\Desktop\laboratoire\lab-manager"
npm install
```

⏱️ **Durée** : 5-10 minutes

### B. Configurer l'URL de l'API

**Ouvrir** : `lab-manager\src\services\api.ts`

**Ligne 13**, remplacer :
```typescript
const API_BASE_URL = 'http://192.168.1.100:8000/api';
```

**Par** (avec VOTRE IP) :
```typescript
const API_BASE_URL = 'http://192.168.1.XXX:8000/api';  // ← VOTRE IP ici
```

**Sauvegarder** le fichier.

---

## 🎯 ÉTAPE 5 : Lancer l'application mobile

### Méthode rapide (Double-clic)
📂 Dans `lab-manager\`, double-cliquez sur : `DEMARRER_APP.bat`

### Méthode manuelle
```bash
cd "c:\Users\ACER ASPIRE V NITRO\Desktop\laboratoire\lab-manager"
npm start
```

**✅ Résultat attendu** :
- Un QR Code s'affiche dans le terminal
- Une page web s'ouvre avec le QR Code

---

## 📱 ÉTAPE 6 : Scanner et tester

### A. Installer Expo Go

**Sur votre smartphone** :
- Android : [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
- iOS : [App Store](https://apps.apple.com/app/expo-go/id982107779)

### B. Scanner le QR Code

1. Ouvrir **Expo Go**
2. Scanner le **QR Code** du terminal
3. L'application se lance ! 🎉

### C. Se connecter

- **Email** : Votre email Django
- **Mot de passe** : Votre mot de passe Django

### D. Explorer l'app

✅ **Dashboard** → Voir les statistiques  
✅ **Scanner** → Nécessite QR codes générés  
✅ **Alertes** → Voir les alertes actives  
✅ **Profil** → Vos informations  

---

## 🎊 C'EST TERMINÉ !

Vous avez maintenant :
- ✅ Backend Django avec API complète
- ✅ Base de données avec modèles ISO 17025
- ✅ Application mobile fonctionnelle
- ✅ Scanner QR Code
- ✅ Dashboard temps réel
- ✅ Système d'alertes

---

## 🐛 Problèmes ?

### "Cannot connect to backend"
```bash
# Vérifier que Django tourne
# Terminal backend doit afficher: "Starting development server..."

# Vérifier l'IP dans api.ts
# Vérifier que PC et téléphone sont sur le même WiFi
```

### "npm install" échoue
```bash
# Vérifier que PowerShell est configuré (Étape 1)
# Ou utiliser CMD au lieu de PowerShell
```

### Caméra ne fonctionne pas
```bash
# Autoriser la caméra dans les paramètres du téléphone
# Redémarrer l'application
```

---

## 📚 Documentation complète

- **Guide installation** : `INSTALLATION_RAPIDE.md`
- **État du projet** : `ETAT_ACTUEL_PROJET.md`
- **Module stock** : `STOCK_MODULE_UPDATE.md`
- **App mobile** : `lab-manager/README.md`
- **Config PowerShell** : `CONFIGURATION_POWERSHELL.md`

---

## 🆘 Besoin d'aide ?

1. Consultez les logs dans les terminaux
2. Vérifiez les fichiers de documentation
3. Vérifiez que toutes les étapes ont été suivies

---

## 🎯 Prochaines étapes (après tests)

1. Créer des données de test (entrepôts, emplacements, lots)
2. Générer des QR Codes pour tester le scanner
3. Configurer les notifications (email, SMS, push)
4. Créer les assets de l'app (logo, icônes)
5. Déployer en production

---

**🚀 Bon développement avec le nouveau module de gestion de stock ISO 17025 ! 🚀**

**Version** : 2.0.0  
**Date** : 1er Décembre 2025  
**Statut** : ✅ PRÊT À TESTER
