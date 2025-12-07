# Redémarrage du serveur Django

**IMPORTANT** : Après les modifications du code backend, vous devez redémarrer le serveur Django.

## Dans le terminal backend :

1. **Arrêter le serveur** : `Ctrl+C`
2. **Redémarrer** : `python manage.py runserver`

## Changements appliqués :

✅ **Modèle Echantillon** : Maintenant lié à `facturation.DemandeAnalyse` (DAN-YYYY-XXXX)
✅ **Serializers** : Corrigés pour utiliser uniquement les champs existants du modèle
✅ **Views** : `select_related` optimisé pour la nouvelle structure

## Une fois redémarré :

1. Rafraîchir la page frontend (F5)
2. La liste des échantillons devrait charger sans erreur 500
3. Vous pourrez créer des échantillons liés à **DAN-2025-0001**
