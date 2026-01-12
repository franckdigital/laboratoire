import { Navigate, createBrowserRouter } from 'react-router-dom'
import { HomePage } from './app/routes/public/HomePage'
import { ProcessDevisPage } from './app/routes/public/ProcessDevisPage'
import { DashboardLayout } from './app/layouts/DashboardLayout'
import { DashboardHomePage } from './app/routes/dashboard/DashboardHomePage'
import { ClientsPage } from './app/routes/dashboard/ClientsPage'
import { EchantillonsPage } from './app/routes/dashboard/EchantillonsPage'
import { EssaisPage } from './app/routes/dashboard/EssaisPage'
import { MetrologiePage } from './app/routes/dashboard/MetrologiePage'
import { StockPage } from './app/routes/dashboard/StockPage'
import { EntrepotsPage } from './app/routes/dashboard/EntrepotsPage'
import { EmplacementsPage } from './app/routes/dashboard/EmplacementsPage'
import { LotsPage } from './app/routes/dashboard/LotsPage'
import { AlertesStockPage } from './app/routes/dashboard/AlertesStockPage'
import { QuarantainesPage } from './app/routes/dashboard/QuarantainesPage'
import { TransfertsPage } from './app/routes/dashboard/TransfertsPage'
import { ReceptionsPage } from './app/routes/dashboard/ReceptionsPage'
import { SortiesStockPage } from './app/routes/dashboard/SortiesStockPage'
import { TracabilitePage } from './app/routes/dashboard/TracabilitePage'
import { StatistiquesStockPage } from './app/routes/dashboard/StatistiquesStockPage'
import { InventairePage } from './app/routes/dashboard/InventairePage'
import { FacturationPage } from './app/routes/dashboard/FacturationPage'
import { QualitePage } from './app/routes/dashboard/QualitePage'
import { ReportingPage } from './app/routes/dashboard/ReportingPage'
import { NotificationsPage } from './app/routes/dashboard/NotificationsPage'
import { AdminUsersPage } from './app/routes/dashboard/AdminUsersPage'
import { AdminProformasPage } from './app/routes/dashboard/AdminProformasPage'
import { AdminAnalysesPage } from './app/routes/dashboard/AdminAnalysesPage'
import { RolePermissionsPage } from './app/routes/dashboard/RolePermissionsPage'
import { ClientLayout } from './app/layouts/ClientLayout'
import { ClientDashboard } from './app/routes/client/ClientDashboard'
import { ClientDemandesPage } from './app/routes/client/ClientDemandesPage'
import { ClientEchantillonsPage } from './app/routes/client/ClientEchantillonsPage'
import { ClientResultatsPage } from './app/routes/client/ClientResultatsPage'
import { ClientFacturesPage } from './app/routes/client/ClientFacturesPage'
import { ClientNotificationsPage } from './app/routes/client/ClientNotificationsPage'
import { DemandeDevisPage } from './app/routes/client/DemandeDevisPage'
import { ProfilPage } from './app/routes/client/ProfilPage'
import { LoginPage } from './app/routes/auth/LoginPage'
import { RegisterPage } from './app/routes/auth/RegisterPage'
import { ForgotPasswordPage } from './app/routes/auth/ForgotPasswordPage'
import { ResetPasswordPage } from './app/routes/auth/ResetPasswordPage'
import { UnauthorizedPage } from './app/routes/UnauthorizedPage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { RoleRedirect } from './components/RoleRedirect'
import { PermissionGuard } from './components/PermissionGuard'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/process-devis',
    element: <ProcessDevisPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute requiredRole="STAFF">
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <PermissionGuard permission="dashboard.view">
            <DashboardHomePage />
          </PermissionGuard>
        ),
      },
      {
        path: 'clients',
        element: (
          <PermissionGuard permission="clients.view">
            <ClientsPage />
          </PermissionGuard>
        ),
      },
      {
        path: 'echantillons',
        element: (
          <PermissionGuard permission="echantillons.view">
            <EchantillonsPage />
          </PermissionGuard>
        ),
      },
      {
        path: 'essais',
        element: (
          <PermissionGuard permission="essais.view">
            <EssaisPage />
          </PermissionGuard>
        ),
      },
      {
        path: 'metrologie',
        element: (
          <PermissionGuard permission="metrologie.view">
            <MetrologiePage />
          </PermissionGuard>
        ),
      },
      {
        path: 'stock',
        element: (
          <PermissionGuard permission="stock.view">
            <StockPage />
          </PermissionGuard>
        ),
      },
      {
        path: 'quarantaines',
        element: <Navigate to="/app/stock/quarantaines" replace />,
      },
      {
        path: 'alertes',
        element: <Navigate to="/app/stock/alertes" replace />,
      },
      {
        path: 'receptions',
        element: <Navigate to="/app/stock/receptions" replace />,
      },
      {
        path: 'sorties',
        element: <Navigate to="/app/stock/sorties" replace />,
      },
      {
        path: 'transferts',
        element: <Navigate to="/app/stock/transferts" replace />,
      },
      {
        path: 'lots',
        element: <Navigate to="/app/stock/lots" replace />,
      },
      {
        path: 'entrepots',
        element: <Navigate to="/app/stock/entrepots" replace />,
      },
      {
        path: 'emplacements',
        element: <Navigate to="/app/stock/emplacements" replace />,
      },
      {
        path: 'stock/entrepots',
        element: (
          <PermissionGuard permission="stock.view">
            <EntrepotsPage />
          </PermissionGuard>
        ),
      },
      {
        path: 'stock/emplacements',
        element: (
          <PermissionGuard permission="stock.view">
            <EmplacementsPage />
          </PermissionGuard>
        ),
      },
      {
        path: 'stock/lots',
        element: (
          <PermissionGuard permission="stock.view">
            <LotsPage />
          </PermissionGuard>
        ),
      },
      {
        path: 'stock/alertes',
        element: (
          <PermissionGuard permission="stock.view">
            <AlertesStockPage />
          </PermissionGuard>
        ),
      },
      {
        path: 'stock/quarantaines',
        element: (
          <PermissionGuard permission="stock.view">
            <QuarantainesPage />
          </PermissionGuard>
        ),
      },
      {
        path: 'stock/transferts',
        element: (
          <PermissionGuard permission="stock.view">
            <TransfertsPage />
          </PermissionGuard>
        ),
      },
      {
        path: 'stock/receptions',
        element: (
          <PermissionGuard permission="stock.view">
            <ReceptionsPage />
          </PermissionGuard>
        ),
      },
      {
        path: 'stock/sorties',
        element: (
          <PermissionGuard permission="stock.view">
            <SortiesStockPage />
          </PermissionGuard>
        ),
      },
      {
        path: 'stock/tracabilite',
        element: (
          <PermissionGuard permission="stock.view">
            <TracabilitePage />
          </PermissionGuard>
        ),
      },
      {
        path: 'stock/statistiques',
        element: (
          <PermissionGuard permission="stock.view">
            <StatistiquesStockPage />
          </PermissionGuard>
        ),
      },
      {
        path: 'stock/inventaires',
        element: (
          <PermissionGuard permission="stock.view">
            <InventairePage />
          </PermissionGuard>
        ),
      },
      {
        path: 'facturation',
        element: (
          <PermissionGuard permission="facturation.view">
            <FacturationPage />
          </PermissionGuard>
        ),
      },
      {
        path: 'qualite',
        element: (
          <PermissionGuard permission="qualite.view">
            <QualitePage />
          </PermissionGuard>
        ),
      },
      {
        path: 'reporting',
        element: (
          <PermissionGuard permission="reporting.view">
            <ReportingPage />
          </PermissionGuard>
        ),
      },
      {
        path: 'notifications',
        element: (
          <PermissionGuard permission="notifications.view">
            <NotificationsPage />
          </PermissionGuard>
        ),
      },
      {
        path: 'admin/users',
        element: (
          <PermissionGuard permission="admin.users">
            <AdminUsersPage />
          </PermissionGuard>
        ),
      },
      {
        path: 'admin/proformas',
        element: (
          <PermissionGuard permission="admin.proformas">
            <AdminProformasPage />
          </PermissionGuard>
        ),
      },
      {
        path: 'admin/analyses',
        element: (
          <PermissionGuard permission="admin.analyses">
            <AdminAnalysesPage />
          </PermissionGuard>
        ),
      },
      {
        path: 'admin/permissions',
        element: (
          <PermissionGuard permission="admin.permissions">
            <RolePermissionsPage />
          </PermissionGuard>
        ),
      },
    ],
  },
  {
    path: '/dashboard',
    element: <RoleRedirect />,
  },
  {
    path: '/client',
    element: (
      <ProtectedRoute requiredRole="CLIENT">
        <ClientLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <ClientDashboard />,
      },
      {
        path: 'demandes',
        element: <ClientDemandesPage />,
      },
      {
        path: 'notifications',
        element: <ClientNotificationsPage />,
      },
      {
        path: 'demande-devis',
        element: <DemandeDevisPage />,
      },
      {
        path: 'echantillons',
        element: <ClientEchantillonsPage />,
      },
      {
        path: 'resultats',
        element: <ClientResultatsPage />,
      },
      {
        path: 'factures',
        element: <ClientFacturesPage />,
      },
      {
        path: 'profil',
        element: <ProfilPage />,
      },
    ],
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
])
