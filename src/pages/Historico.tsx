import { Header } from '@/components/layout/Header'

const Historico = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto p-6">
        <h2 className="text-xl font-semibold mb-2">Histórico</h2>
        <p className="text-sm text-muted-foreground">Em breve: visualização do histórico de cálculos.</p>
      </main>
    </div>
  )
}

export default Historico


