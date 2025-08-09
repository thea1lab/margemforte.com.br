import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button-variants'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
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
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(id)
  }, [search])

  useEffect(() => {
    let isCancelled = false
    const load = async () => {
      try {
        setIsLoading(true)
        const { listCalculatorHistoryPaged } = await import('@/integrations/supabase/calculatorHistory')
        const { data, count } = await listCalculatorHistoryPaged({ page, pageSize, search: debouncedSearch })
        if (!isCancelled) {
          setRows(data || [])
          setTotal(count || 0)
        }
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
  }, [page, pageSize, debouncedSearch])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-5xl mx-auto px-3 sm:p-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="hidden sm:flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Histórico</h2>
          </div>
          <Button variant="default" onClick={() => navigate('/') } className="w-full sm:w-auto justify-center flex items-center gap-2">
            <Plus className="h-4 w-4" /> Nova simulação
          </Button>
        </div>

        <Card className="bg-white rounded-xl shadow-lg p-3 sm:p-6">
          <CardHeader className="p-0 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <CardTitle className="text-base">Simulações salvas</CardTitle>
              <div className="w-full md:max-w-xs mb-4 md:mb-0">
                <Input
                  placeholder="Buscar por nome da simulação..."
                  value={search}
                  onChange={(e) => { setPage(1); setSearch(e.target.value) }}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Carregando...</div>
            ) : error ? (
              <div className="text-sm text-destructive">{error}</div>
            ) : rows.length === 0 ? (
              <div className="text-sm text-muted-foreground">Nenhuma simulação salva ainda.</div>
            ) : (
              <div className="rounded-md border">
                <Table className="min-w-[640px] sm:min-w-[720px] md:min-w-0 md:w-full md:table-auto">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="md:w-[32%] md:px-3">Nome</TableHead>
                      <TableHead className="md:w-[18%] md:px-3">Criado em</TableHead>
                      <TableHead className="md:w-[16%] md:px-3">Valor do serviço</TableHead>
                      <TableHead className="md:w-[16%] md:px-3">Custo total</TableHead>
                      <TableHead className="md:w-[7%] md:px-3">Margem</TableHead>
                      <TableHead className="md:w-[7%] md:px-3 text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => {
                      const totalCost = (r.travel_costs || 0) + (r.materials || 0) + (r.hours_worked || 0) * (r.hourly_rate || 0)
                      const created = new Date(r.created_at)
                      const createdFmt = created.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
                      return (
                        <TableRow key={r.id} className="cursor-pointer" onClick={() => navigate(`/?id=${r.id}`)}>
                          <TableCell className="md:w-[32%] md:p-3 align-top">
                            <div className="font-medium break-words whitespace-normal">{r.simulation_name || 'Sem nome'}</div>
                          </TableCell>
                          <TableCell className="md:w-[18%] md:p-3 align-top whitespace-normal">{createdFmt}</TableCell>
                          <TableCell className="md:w-[16%] md:p-3 align-top break-all whitespace-normal text-right">{formatBRL(r.service_value)}</TableCell>
                          <TableCell className="md:w-[16%] md:p-3 align-top break-all whitespace-normal text-right">{formatBRL(totalCost)}</TableCell>
                          <TableCell className="md:w-[7%] md:p-3 align-top break-all whitespace-normal text-right">{(r.desired_margin ?? 0).toFixed(0)}%</TableCell>
                          <TableCell className="md:w-[7%] md:p-3 align-top text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="inline-flex items-center gap-2"
                              onClick={(e) => { e.stopPropagation(); navigate(`/?id=${r.id}`) }}
                              aria-label="Abrir Simulação"
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
            <div className="mt-3 space-y-3">
              <div className="text-xs text-muted-foreground">
                Dica: clique em uma linha para abrir a simulação.
              </div>
              <div className="w-full">
                <Pagination>
                  <PaginationContent className="flex flex-nowrap items-center justify-center gap-2">
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)) }}
                        className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <div className="text-xs text-muted-foreground px-2">
                        Página {page} de {Math.max(1, Math.ceil(total / pageSize))}
                      </div>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => { e.preventDefault(); setPage((p) => (p < Math.ceil(total / pageSize) ? p + 1 : p)) }}
                        className={page >= Math.ceil(total / pageSize) ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default Historico


