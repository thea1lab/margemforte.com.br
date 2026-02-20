import { Header } from '@/components/layout/Header'
import { MarginCalculator } from '@/components/calculator/MarginCalculator'

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-3 sm:px-6 py-6">
        <MarginCalculator />
      </main>
    </div>
  )
}

export default Index
