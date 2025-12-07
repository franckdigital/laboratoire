# ✅ Backend Update - Gestion des utilisateurs

## 🎯 Modifications apportées

### Nouvelles vues ajoutées (views_auth.py)

1. **AdminUserUpdateView**
   - Permet aux admins de modifier les utilisateurs
   - URL: `/api/auth/admin/users/{id}/update/`
   - Méthode: `PATCH`
   - Gère le hachage du mot de passe si fourni
   - Mise à jour partielle supportée

2. **AdminUserDeleteView**
   - Permet aux admins de supprimer les utilisateurs
   - URL: `/api/auth/admin/users/{id}/delete/`
   - Méthode: `DELETE`
   - Protection: empêche la suppression de son propre compte

### Nouvelles routes ajoutées (urls_auth.py)

```python
path('admin/users/<uuid:id>/update/', views_auth.AdminUserUpdateView.as_view(), name='admin_update_user'),
path('admin/users/<uuid:id>/delete/', views_auth.AdminUserDeleteView.as_view(), name='admin_delete_user'),
```

## 🔒 Sécurité

- ✅ Vérification du rôle ADMIN
- ✅ Hachage automatique du mot de passe
- ✅ Protection contre l'auto-suppression
- ✅ Authentification requise

## 🚀 Redémarrage requis

**IMPORTANT** : Redémarrez le serveur Django pour activer les changements.

```bash
# Dans le terminal backend
Ctrl+C
python manage.py runserver
```

## ✨ Fonctionnalités

### Édition d'utilisateur
```
PATCH /api/auth/admin/users/{id}/update/
Content-Type: application/json

{
  "first_name": "Nouveau prénom",
  "last_name": "Nouveau nom",
  "email": "newemail@example.com",
  "role": "TECHNICIEN",
  "password": "nouveau_mot_de_passe" // optionnel
}
```

### Suppression d'utilisateur
```
DELETE /api/auth/admin/users/{id}/delete/
```

## 🎉 Frontend prêt

Le frontend est déjà configuré pour utiliser ces endpoints :
- `api.adminUsers.update(userId, data)`
- `api.adminUsers.delete(userId)`

Les modales et toasts sont également implémentés !

## 🧪 Test rapide

1. Connectez-vous en tant qu'admin
2. Allez sur la page "Utilisateurs"
3. Cliquez sur "Éditer" pour modifier un utilisateur
4. Cliquez sur "Supprimer" pour supprimer (avec confirmation)
5. Les toasts de notification s'afficheront automatiquement
