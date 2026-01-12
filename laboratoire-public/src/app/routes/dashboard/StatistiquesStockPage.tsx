import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Package,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Calendar,
  PieChart
} from 'lucide-react'
import { stockAPI } from '../../../services/api'

interface StockStats {
  total_articles: number
  total_lots: number
  lots_ouverts: number
  valeur_stock_estimee: number
  articles_par_categorie: Array<{ categorie: string; count: number }>
  lots_par_statut: Array<{ statut: string; count: number }>
}

interface MouvementsStats {
  total_mouvements: number
  entrees: { nombre: number; quantite: number }
  sorties: { nombre: number; quantite: number }
  transferts: number
  ajustements: number
  mouvements_par_type: Array<{ type_mouvement: string; count: number; quantite_totale: number }>
  evolution_journaliere: Array<{ date: string; type_mouvement: string; count: number; quantite: number }>
}

interface SortiesStats {
  sorties_validees: number
  sorties_en_attente: number
  sorties_par_type: Array<{ type_sortie: string; count: number; quantite_totale: number }>
}

export function StatistiquesStockPage() {
  const [stockStats, setStockStats] = useState<StockStats | null>(null)
  const [mouvementsStats, setMouvementsStats] = useState<MouvementsStats | null>(null)
  const [sortiesStats, setSortiesStats] = useState<SortiesStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [periode, setPeriode] = useState('30')

  useEffect(() => {
    loadStats()
  }, [periode])

  const loadStats = async () => {
    try {
      setLoading(true)
      const params = { jours: periode }
      
      const [stock, mouvements, sorties] = await Promise.all([
        stockAPI.statistiques.stock(),
        stockAPI.statistiques.mouvements(params),
        stockAPI.statistiques.sorties(params)
      ])
      
      setStockStats(stock)
      setMouvementsStats(mouvements)
      setSortiesStats(sorties)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des statistiques')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Statistiques Stock</h1>
          <p className="text-gray-600">Vue d'ensemble et analyses du stock</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">7 derniers jours</option>
            <option value="30">30 derniers jours</option>
            <option value="90">90 derniers jours</option>
            <option value="365">Cette année</option>
          </select>
          <button
            onClick={loadStats}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Articles</p>
              <p className="text-3xl font-bold text-gray-900">{stockStats?.total_articles || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Lots Actifs</p>
              <p className="text-3xl font-bold text-gray-900">{stockStats?.lots_ouverts || 0}</p>
              <p className="text-xs text-gray-400 mt-1">sur {stockStats?.total_lots || 0} lots</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Entrées période</p>
              <p className="text-3xl font-bold text-green-600">+{mouvementsStats?.entrees?.nombre || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Sorties période</p>
              <p className="text-3xl font-bold text-red-600">-{mouvementsStats?.sorties?.nombre || 0}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <ArrowDownRight className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques et détails */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition des mouvements */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-600" />
            Répartition des mouvements
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Entrées', value: mouvementsStats?.entrees?.nombre || 0, color: 'bg-green-500' },
              { label: 'Sorties', value: mouvementsStats?.sorties?.nombre || 0, color: 'bg-red-500' },
              { label: 'Transferts', value: mouvementsStats?.mouvements_par_type?.find(m => m.type_mouvement === 'TRANSFERT')?.count || 0, color: 'bg-blue-500' },
              { label: 'Ajustements', value: mouvementsStats?.mouvements_par_type?.find(m => m.type_mouvement === 'AJUSTEMENT')?.count || 0, color: 'bg-purple-500' },
            ].map((item) => {
              const total = (mouvementsStats?.entrees?.nombre || 0) + (mouvementsStats?.sorties?.nombre || 0) + 
                (mouvementsStats?.mouvements_par_type?.reduce((acc, m) => acc + m.count, 0) || 0) || 1
              const percentage = Math.round((item.value / total) * 100)
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-medium">{item.value} ({percentage}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color} rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Sorties par type */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            Sorties par type
          </h3>
          <div className="space-y-3">
            {sortiesStats?.sorties_par_type?.map((item) => (
              <div key={item.type_sortie} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{item.type_sortie}</p>
                  <p className="text-sm text-gray-500">{item.count} sorties</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">-{item.quantite_totale || 0}</p>
                  <p className="text-xs text-gray-400">unités</p>
                </div>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-4">Aucune donnée disponible</p>
            )}
          </div>
        </div>

        {/* Articles par catégorie */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" />
            Articles par catégorie
          </h3>
          <div className="space-y-3">
            {stockStats?.articles_par_categorie?.map((item) => (
              <div key={item.categorie} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">{item.categorie || 'Non catégorisé'}</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                  {item.count}
                </span>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-4">Aucune donnée disponible</p>
            )}
          </div>
        </div>

        {/* Résumé des sorties */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-orange-600" />
            Résumé des sorties
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">{sortiesStats?.sorties_validees || 0}</p>
              <p className="text-sm text-green-700">Validées</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-3xl font-bold text-yellow-600">{sortiesStats?.sorties_en_attente || 0}</p>
              <p className="text-sm text-yellow-700">En attente</p>
            </div>
            <div className="col-span-2 text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-gray-900">
                {sortiesStats?.sorties_par_type?.reduce((sum, item) => sum + (item.quantite_totale || 0), 0) || 0}
              </p>
              <p className="text-sm text-gray-600">Quantité totale sortie</p>
            </div>
          </div>
        </div>
      </div>

      {/* Évolution journalière */}
      {mouvementsStats?.evolution_journaliere && mouvementsStats.evolution_journaliere.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Évolution des mouvements
          </h3>
          <div className="overflow-x-auto">
            <div className="flex gap-2 min-w-max pb-2">
              {(() => {
                // Group by date and aggregate entrees/sorties
                const grouped = mouvementsStats.evolution_journaliere.reduce((acc, item) => {
                  const dateKey = typeof item.date === 'string' ? item.date : new Date(item.date).toISOString().split('T')[0]
                  if (!acc[dateKey]) acc[dateKey] = { entrees: 0, sorties: 0 }
                  if (item.type_mouvement === 'ENTREE') acc[dateKey].entrees += item.count
                  if (item.type_mouvement === 'SORTIE') acc[dateKey].sorties += item.count
                  return acc
                }, {} as Record<string, { entrees: number; sorties: number }>)
                
                return Object.entries(grouped).slice(-14).map(([date, data]) => (
                  <div key={date} className="flex flex-col items-center w-16">
                    <div className="flex flex-col gap-1 h-32 justify-end">
                      <div 
                        className="w-6 bg-green-500 rounded-t"
                        style={{ height: `${Math.min(data.entrees * 10, 60)}px` }}
                        title={`Entrées: ${data.entrees}`}
                      />
                      <div 
                        className="w-6 bg-red-500 rounded-b"
                        style={{ height: `${Math.min(data.sorties * 10, 60)}px` }}
                        title={`Sorties: ${data.sorties}`}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                    </p>
                  </div>
                ))
              })()}
            </div>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-600">Entrées</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-gray-600">Sorties</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
