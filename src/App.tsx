import { Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/lib/AuthContext'
import Home from './pages/Home'
import Room from './pages/Room'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:code" element={<Room />} />
        </Routes>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
