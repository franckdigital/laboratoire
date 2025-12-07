import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { AuthProvider } from './contexts/AuthContext'
import { PermissionsProvider } from './contexts/PermissionsContext'

function App() {
  return (
    <AuthProvider>
      <PermissionsProvider>
        <RouterProvider router={router} />
      </PermissionsProvider>
    </AuthProvider>
  )
}

export default App
