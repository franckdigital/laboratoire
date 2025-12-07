@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  LANEMA Lab Manager - Démarrage Application Mobile       ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 📱 Configuration requise:
echo    1. Le serveur Django doit être démarré
echo    2. Les dépendances npm doivent être installées
echo    3. L'URL API doit être configurée dans src/services/api.ts
echo.
echo 📋 Étapes:
echo    - Expo va démarrer
echo    - Scannez le QR Code avec l'app Expo Go
echo    - L'application se lance sur votre téléphone
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo ⏳ Démarrage d'Expo...
echo.

cd /d "c:\Users\ACER ASPIRE V NITRO\Desktop\laboratoire\lab-manager"

REM Vérifier si node_modules existe
if not exist "node_modules" (
    echo.
    echo ⚠️  ATTENTION: Les dépendances ne sont pas installées!
    echo.
    echo 📦 Installation des dépendances en cours...
    echo    Cela peut prendre 5-10 minutes...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo ❌ Erreur lors de l'installation des dépendances
        echo.
        echo 💡 Solutions:
        echo    1. Vérifiez votre connexion internet
        echo    2. Exécutez: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
        echo    3. Ou utilisez CMD au lieu de PowerShell
        echo.
        pause
        exit /b 1
    )
)

echo.
echo ✅ Dépendances OK - Démarrage d'Expo...
echo.

call npx expo start

echo.
echo 📱 Pour arrêter l'application: Appuyez sur Ctrl+C
echo.
pause
