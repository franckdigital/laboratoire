# Guide d'utilisation des composants Modal

Ce guide explique comment utiliser les composants de modal réutilisables dans l'application LANEMA.

## 📦 Composants disponibles

### 1. **Modal** - Modal générique
Modal réutilisable pour afficher du contenu personnalisé.

```tsx
import { Modal } from '../../../components/Modal'

<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Titre de la modal"
  maxWidth="2xl" // sm | md | lg | xl | 2xl | 4xl
>
  {/* Votre contenu ici */}
</Modal>
```

### 2. **AlertModal** - Modal de confirmation
Modal pour les alertes et confirmations avec styles prédéfinis.

```tsx
import { AlertModal } from '../../../components/AlertModal'

<AlertModal
  isOpen={showAlert}
  onClose={() => setShowAlert(false)}
  onConfirm={handleConfirm}
  title="Confirmer l'action"
  message="Êtes-vous sûr de vouloir continuer ?"
  type="danger" // success | warning | danger | info
  confirmText="Confirmer"
  cancelText="Annuler"
  isLoading={isSubmitting}
/>
```

**Types disponibles :**
- `success` - Vert avec icône de succès
- `warning` - Ambre avec icône d'avertissement
- `danger` - Rouge avec icône de danger
- `info` - Bleu avec icône d'information

### 3. **Toast** - Notifications
Notifications temporaires pour informer l'utilisateur.

```tsx
import { Toast } from '../../../components/Toast'

const [toast, setToast] = useState({
  message: '',
  type: 'success',
  visible: false
})

const showToast = (message: string, type: 'success' | 'error') => {
  setToast({ message, type, visible: true })
}

<Toast
  message={toast.message}
  type={toast.type} // success | error | info | warning
  isVisible={toast.visible}
  onClose={() => setToast({ ...toast, visible: false })}
  duration={3000} // optionnel, défaut: 3000ms
/>
```

## 🎨 Exemple complet

```tsx
import { useState } from 'react'
import { Modal } from '../../../components/Modal'
import { AlertModal } from '../../../components/AlertModal'
import { Toast } from '../../../components/Toast'

export function MyComponent() {
  const [showModal, setShowModal] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [toast, setToast] = useState({
    message: '',
    type: 'success' as 'success' | 'error',
    visible: false
  })

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, visible: true })
  }

  const handleDelete = async () => {
    try {
      await api.delete(itemId)
      showToast('Élément supprimé avec succès!', 'success')
      setShowDeleteAlert(false)
    } catch (error) {
      showToast('Erreur lors de la suppression', 'error')
    }
  }

  return (
    <>
      {/* Votre contenu */}
      
      {/* Modal générique */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Modifier l'élément"
      >
        <form>
          {/* Formulaire */}
        </form>
      </Modal>

      {/* Alert de confirmation */}
      <AlertModal
        isOpen={showDeleteAlert}
        onClose={() => setShowDeleteAlert(false)}
        onConfirm={handleDelete}
        title="Supprimer l'élément"
        message="Cette action est irréversible."
        type="danger"
        confirmText="Supprimer"
        cancelText="Annuler"
      />

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </>
  )
}
```

## ✨ Animations

Les composants utilisent des animations CSS définies dans `index.css` :
- `animate-fadeIn` - Fondu d'entrée
- `animate-slideUp` - Glissement vers le haut
- `animate-slideDown` - Glissement vers le bas

## 🎯 Bonnes pratiques

1. **Toujours fermer les modales** après une action réussie
2. **Utiliser AlertModal** pour les actions destructrices (suppression, etc.)
3. **Afficher des Toasts** pour confirmer les actions
4. **Ne pas empiler** plusieurs modales en même temps
5. **Gérer l'état isLoading** dans AlertModal pour désactiver les boutons pendant les requêtes

## 🚀 Pages déjà migrées

- ✅ **AdminUsersPage** - Gestion des utilisateurs avec édition/suppression
- 🔄 **EchantillonsPage** - À migrer
- 🔄 **Autres pages** - À migrer progressivement
