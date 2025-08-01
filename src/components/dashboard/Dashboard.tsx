import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/layout/Header'
import { MarginCalculator } from '@/components/calculator/MarginCalculator'

export const Dashboard = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Main Calculator (Full Width) */}
      <main className="max-w-2xl mx-auto p-6">
        <MarginCalculator />
      </main>
    </div>
  )
}