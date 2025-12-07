@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  LANEMA - Démarrage Serveur Backend Django               ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 📊 Démarrage du serveur Django...
echo 🌐 Le serveur sera accessible sur: http://0.0.0.0:8000
echo.
echo ⚠️  GARDEZ CETTE FENÊTRE OUVERTE pendant l'utilisation
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

cd /d "c:\Users\ACER ASPIRE V NITRO\Desktop\laboratoire\laboratoire-backend"
python manage.py runserver 0.0.0.0:8000

pause
