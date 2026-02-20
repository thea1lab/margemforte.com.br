import { Header } from '@/components/layout/Header'
import { MarginCalculator } from '@/components/calculator/MarginCalculator'

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <MarginCalculator />
      </main>
    </div>
  )
}

export default Index
