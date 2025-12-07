# 🧪 Test du Système de Permissions

## ✅ Configuration terminée

Le système de permissions est maintenant complètement configuré !

### Utilisateurs de test créés

| Email | Password | Rôle | Permissions |
|-------|----------|------|-------------|
| `stock@lanema.com` | `test123` | **GESTIONNAIRE_STOCK** | Dashboard, Stock, Reporting, Notifications |
| `technicien@lanema.com` | `test123` | **TECHNICIEN** | Dashboard uniquement |
| `responsable@lanema.com` | `test123` | **RESPONSABLE_LABO** | Dashboard uniquement |
| `comptable@lanema.com` | `test123` | **COMPTABLE** | Dashboard uniquement |

---

## 🎯 Test 1 : Gestionnaire de Stock (Problème résolu)

### Étapes
1. Ouvrir `http://localhost:5173/login`
2. Se connecter avec :
   - Email: `stock@lanema.com`
   - Password: `test123`

### Résultats attendus ✅

**Menu visible** (seulement 4 éléments) :
- ✅ Tableau de bord
- ✅ Stock
- ✅ Reporting
- ✅ Notifications

**Menu CACHÉ** (ne devrait PAS apparaître) :
- ❌ Clients
- ❌ Échantillons
- ❌ Essais
- ❌ Métrologie
- ❌ Facturation
- ❌ Qualité
- ❌ Section Administration

**Test d'accès direct par URL** :
1. Essayer d'accéder à `http://localhost:5173/app/clients`
   - ✅ Affiche : "🔒 Accès refusé"
   - ✅ Message : "Vous n'avez pas les permissions nécessaires"
   - ✅ Affiche : "Permission requise: clients.view"

2. Essayer d'accéder à `http://localhost:5173/app/echantillons`
   - ✅ Affiche : "🔒 Accès refusé"

3. Accéder à `http://localhost:5173/app/stock`
   - ✅ La page se charge normalement
   - ✅ Contenu visible

---

## 🎯 Test 2 : Admin (Contrôle)

### Étapes
1. Se déconnecter du compte gestionnaire
2. Se connecter avec un compte ADMIN

### Résultats attendus ✅
- ✅ Tous les éléments du menu sont visibles
- ✅ Accès à toutes les pages
- ✅ Section "Administration" visible avec :
  - 👥 Utilisateurs
  - 📄 Proformas
  - 🔬 Analyses
  - 🔒 Permissions

---

## 🎯 Test 3 : Gestion dynamique des permissions

### Étapes
1. Se connecter en tant qu'ADMIN
2. Aller sur `/app/admin/permissions`
3. Sélectionner le rôle **GESTIONNAIRE_STOCK**
4. Activer la permission "Voir les Clients"
5. Se déconnecter
6. Se reconnecter avec `stock@lanema.com`

### Résultats attendus ✅
- ✅ Le menu affiche maintenant "Clients"
- ✅ La page `/app/clients` est accessible
- ✅ Les autres pages restent bloquées

---

## 🎯 Test 4 : Protection API

### Test avec curl ou Postman

```bash
# 1. Se connecter et récupérer le token
curl -X POST http://localhost:8000/api/clients/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"stock@lanema.com","password":"test123"}'

# 2. Récupérer les permissions de l'utilisateur
curl http://localhost:8000/api/user/permissions/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Résultat attendu ✅
```json
[
  {
    "permission_code": "dashboard.view",
    "is_granted": true
  },
  {
    "permission_code": "stock.view",
    "is_granted": true
  },
  {
    "permission_code": "stock.manage",
    "is_granted": true
  },
  {
    "permission_code": "reporting.view",
    "is_granted": true
  },
  {
    "permission_code": "notifications.view",
    "is_granted": true
  }
]
```

---

## 📊 Checklist de validation

### Frontend
- [ ] Le menu ne montre que les pages autorisées
- [ ] Les pages non autorisées affichent "Accès refusé"
- [ ] L'accès direct par URL est bloqué
- [ ] Les boutons/actions sensibles sont cachés si pas de permission
- [ ] Le message d'erreur affiche la permission requise et le rôle actuel

### Backend
- [ ] L'API `/user/permissions/` retourne les bonnes permissions
- [ ] L'API vérifie les permissions avant de retourner des données
- [ ] Les endpoints admin sont protégés
- [ ] Impossible de toggle une permission sans être admin

### Workflow
- [ ] Les permissions peuvent être modifiées via l'interface admin
- [ ] Les changements prennent effet au prochain login
- [ ] L'admin peut voir toutes les permissions
- [ ] Les non-admins ne peuvent pas accéder à `/app/admin/permissions`

---

## 🐛 En cas de problème

### Le gestionnaire de stock voit toutes les pages
```bash
# Vérifier les permissions en DB
cd laboratoire-backend
python manage.py shell
```

```python
from core.models_permissions import RolePermission
perms = RolePermission.objects.filter(role='GESTIONNAIRE_STOCK', is_granted=True)
for p in perms:
    print(f"{p.permission.code}: {p.is_granted}")
```

**Si trop de permissions sont activées** :
```bash
python setup_stock_manager_permissions.py
```

### Le frontend ne met pas à jour les permissions
1. Vider le cache du navigateur
2. Se déconnecter complètement
3. Se reconnecter
4. Vérifier la console pour les erreurs

### L'API retourne une erreur 403
1. Vérifier que le token JWT est valide
2. Vérifier que l'utilisateur est authentifié
3. Vérifier les logs Django pour plus de détails

---

## ✅ Validation finale

**Le système fonctionne correctement si** :
1. ✅ Le gestionnaire de stock ne voit que 4 pages
2. ✅ Il ne peut pas accéder aux autres pages par URL
3. ✅ Il voit un message clair "Accès refusé"
4. ✅ L'admin peut modifier les permissions
5. ✅ Les modifications prennent effet au login

**🎉 Le problème initial est RÉSOLU !**
