import { Link } from 'react-router-dom'
import { PublicLayout } from '../../layouts/PublicLayout'

export function HomePage() {
  return (
    <PublicLayout>
      <section className="max-w-6xl mx-auto px-6 py-12 grid gap-10 md:grid-cols-[1.1fr_0.9fr] items-center">
        <div>
          <p className="text-xs font-semibold tracking-[0.25em] text-lanema-blue-600 uppercase mb-3">
            LAB MANAGER
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-4">
            Une plateforme unifiée pour gérer l&apos;ensemble des activités d'un laboratoire
          </h1>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed max-w-xl">
            Du dépôt des échantillons jusqu&apos;au rapport final et à la facturation, la plateforme LAB MANAGER
            centralise les données, facilite le suivi qualité et permet une traçabilité complète.
          </p>
          <div className="flex flex-wrap gap-3 mb-8">
            <Link
              to="/client"
              className="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold text-white bg-lanema-blue-600 hover:bg-lanema-blue-700 shadow-md shadow-lanema-blue-600/30 transition"
            >
              Accéder au portail
            </Link>
            <Link
              to="/process-devis"
              className="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold text-lanema-blue-700 bg-lanema-blue-50 hover:bg-lanema-blue-100 border border-lanema-blue-100 transition"
            >
              Comment faire une demande de devis
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs text-slate-600">
            <div className="lanema-card p-4">
              <div className="text-[11px] font-semibold text-lanema-blue-600 mb-1">Qualité & Métrologie</div>
              <p>
                Pilotage des non-conformités, actions correctives, audits et étalonnages au même endroit.
              </p>
            </div>
            <div className="lanema-card p-4">
              <div className="text-[11px] font-semibold text-lanema-blue-600 mb-1">Traçabilité complète</div>
              <p>
                Suivi des échantillons, essais, rapports et facturation avec historique détaillé.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="lanema-card p-5">
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
              <img
                src="/labo.jpg"
                alt="Laboratoire"
                className="w-full h-64 object-cover"
                loading="lazy"
              />
            </div>
          </div>

          <div id="modules" className="lanema-card p-5">
            <div className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">
              Modules couverts
            </div>
            <ul className="grid grid-cols-2 gap-2 text-xs text-slate-600">
              <li>• Demande de devis</li>
              <li>• Échantillons</li>
              <li>• Essais</li>
              <li>• Métrologie</li>
              <li>• Stock</li>
              <li>• Facturation</li>
              <li>• Qualité</li>
              <li>• Reporting</li>
              <li>• Notifications</li>
            </ul>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
