interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  type?: 'success' | 'warning' | 'danger' | 'info'
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
}

export function AlertModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  isLoading = false
}: AlertModalProps) {
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100">
            <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )
      case 'warning':
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100">
            <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        )
      case 'danger':
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-100">
            <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )
    }
  }

  const getButtonColor = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-700'
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700'
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-700'
      default:
        return 'bg-lanema-blue-600 hover:bg-lanema-blue-700'
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {getIcon()}
          <div className="mt-3 text-center sm:mt-5">
            <h3 className="text-lg font-semibold text-slate-900">
              {title}
            </h3>
            <div className="mt-2">
              <p className="text-sm text-slate-600">
                {message}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2 rounded-b-xl">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full inline-flex justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm ${getButtonColor()} transition disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Chargement...
              </>
            ) : confirmText}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="mt-3 w-full inline-flex justify-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed sm:mt-0 sm:w-auto"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  )
}
