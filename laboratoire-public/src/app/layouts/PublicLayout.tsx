import { PropsWithChildren } from 'react'
import { Link } from 'react-router-dom'

export function PublicLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="lanema-gradient-header text-white shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-white/60 flex items-center justify-center">
              <span className="text-lg font-semibold">LM</span>
            </div>
            <div>
              <div className="text-xl font-semibold tracking-[0.25em] uppercase">LAB MANAGER</div>
              <p className="text-[11px] opacity-80 leading-tight">
                Plateforme unifiée de gestion de l'ensemble des activités d'un laboratoire
              </p>
            </div>
          </div>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link to="/" className="hover:underline underline-offset-4">
              Accueil
            </Link>
            <Link to="/app" className="lanema-badge bg-white/10 border border-white/40 text-white hover:bg-white hover:text-lanema-blue-700">
              Accès au portail
            </Link>
          </nav>
        </div>
      </header>

      {/* Contenu */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/80 backdrop-blur-sm text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <span>© {new Date().getFullYear()} LAB MANAGER. Tous droits réservés.</span>
          <span>Plateforme de gestion de laboratoire</span>
        </div>
      </footer>
    </div>
  )
}
