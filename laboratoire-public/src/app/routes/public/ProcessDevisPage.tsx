import { Link } from 'react-router-dom'
import { PublicLayout } from '../../layouts/PublicLayout'

export function ProcessDevisPage() {
  const steps = [
    {
      title: '1. Déposer une demande de devis',
      description:
        'Depuis votre espace client, décrivez votre besoin (type d’analyse, catégorie, objet, description). Vous recevez une confirmation.'
    },
    {
      title: '2. Réception & étude par le laboratoire',
      description:
        'Notre équipe analyse la demande, vérifie la faisabilité, les délais et prépare la proposition.'
    },
    {
      title: '3. Réception du devis (Proforma)',
      description:
        'Vous recevez un devis chiffré. Vous pouvez le consulter puis l’accepter directement en ligne.'
    },
    {
      title: '4. Acceptation du devis',
      description:
        'Après acceptation, la demande d’analyse est créée. Vous êtes guidé pour la suite du processus.'
    },
    {
      title: '5. Dépôt des échantillons',
      description:
        'Vous déposez les échantillons. Le laboratoire confirme la réception et lance la préparation.'
    },
    {
      title: '6. Analyse en laboratoire',
      description:
        'Les analyses démarrent. Vous suivez l’avancement et recevez une notification lors des étapes clés.'
    },
    {
      title: '7. Facturation',
      description:
        'Une facture est émise. Elle apparaît dans votre espace client, avec le statut de paiement associé.'
    },
    {
      title: '8. Paiement & validation',
      description:
        'Vous soumettez une preuve de paiement. La comptabilité vérifie, puis valide la facture.'
    },
    {
      title: '9. Rapport & résultats',
      description:
        'Une fois l’analyse terminée, vous accédez au rapport et aux résultats depuis votre espace.'
    },
  ]

  return (
    <PublicLayout>
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col gap-2 mb-8">
          <p className="text-xs font-semibold tracking-[0.25em] text-lanema-blue-600 uppercase">
            Processus client
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">
            Comment faire un devis ?
          </h1>
          <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
            Voici le parcours complet, de la demande de devis jusqu’à la facturation et la validation du paiement.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] items-start">
          <div className="lanema-card p-6 overflow-hidden">
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
              <img
                src="/labo.jpg"
                alt="Laboratoire"
                className="w-full h-72 object-cover"
                loading="lazy"
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/client"
                className="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold text-lanema-blue-700 bg-lanema-blue-50 hover:bg-lanema-blue-100 border border-lanema-blue-100 transition"
              >
                Accéder au portail
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <div className="lanema-card p-6">
              <div className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">
                Étapes détaillées
              </div>
              <div className="space-y-3">
                {steps.map((s, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-lanema-blue-50 border border-lanema-blue-100 flex items-center justify-center text-lanema-blue-700 font-semibold">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{s.title.replace(/^\d+\.\s*/, '')}</div>
                        <p className="text-sm text-slate-600 leading-relaxed mt-1">{s.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lanema-card p-6">
              <div className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                Conseils
              </div>
              <ul className="text-sm text-slate-600 space-y-2">
                <li>Préparez la description de l’analyse et toute information utile (norme, matrice, quantité).</li>
                <li>Suivez vos notifications: elles indiquent les changements de statut (devis, analyse, facture).</li>
                <li>Lors du paiement, téléversez une preuve lisible (photo nette ou PDF).</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
