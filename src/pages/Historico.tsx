import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button-variants'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { History, ExternalLink, Plus } from 'lucide-react'

type HistoryRow = {
  id: string
  created_at: string
  simulation_name: string
  service_value: number
  travel_costs: number
  hours_worked: number
  hourly_rate: number
  materials: number
  desired_margin: number
}

const formatBRL = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const Historico = () => {
  const navigate = useNavigate()
  const [rows, setRows] = useState<HistoryRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false
    const load = async () => {
      try {
        const { listCalculatorHistory } = await import('@/integrations/supabase/calculatorHistory')
        const data = await listCalculatorHistory()
        if (!isCancelled) setRows(data || [])
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
        if (!isCancelled) setError('Não foi possível carregar o histórico.')
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }
    load()
    return () => { isCancelled = true }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Histórico</h2>
          </div>
          <Button variant="default" onClick={() => navigate('/') } className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Nova simulação
          </Button>
        </div>

        <Card className="bg-white rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-base">Simulações salvas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Carregando...</div>
            ) : error ? (
              <div className="text-sm text-destructive">{error}</div>
            ) : rows.length === 0 ? (
              <div className="text-sm text-muted-foreground">Nenhuma simulação salva ainda.</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead className="hidden md:table-cell">Criado em</TableHead>
                      <TableHead className="hidden lg:table-cell">Valor do serviço</TableHead>
                      <TableHead className="hidden lg:table-cell">Custo total</TableHead>
                      <TableHead className="hidden lg:table-cell">Margem desejada</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => {
                      const totalCost = (r.travel_costs || 0) + (r.materials || 0) + (r.hours_worked || 0) * (r.hourly_rate || 0)
                      const created = new Date(r.created_at)
                      const createdFmt = created.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
                      return (
                        <TableRow key={r.id} className="cursor-pointer" onClick={() => navigate(`/?id=${r.id}`)}>
                          <TableCell>
                            <div className="font-medium">{r.simulation_name || 'Sem nome'}</div>
                            <div className="text-xs text-muted-foreground md:hidden">{createdFmt}</div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{createdFmt}</TableCell>
                          <TableCell className="hidden lg:table-cell">{formatBRL(r.service_value)}</TableCell>
                          <TableCell className="hidden lg:table-cell">{formatBRL(totalCost)}</TableCell>
                          <TableCell className="hidden lg:table-cell">{(r.desired_margin ?? 0).toFixed(0)}%</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="inline-flex items-center gap-2"
                              onClick={(e) => { e.stopPropagation(); navigate(`/?id=${r.id}`) }}
                              aria-label="Abrir no calculador"
                            >
                              <ExternalLink className="h-4 w-4" /> Abrir
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
            <Separator className="my-6" />
            <div className="text-xs text-muted-foreground">
              Dica: clique em uma linha para abrir a simulação no calculador.
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default Historico


