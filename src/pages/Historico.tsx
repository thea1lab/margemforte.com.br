import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button-variants'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { History, ExternalLink, Plus, Trash2, Download, Copy } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from '@/components/ui/sonner'
import {
  listCalculations,
  deleteCalculation,
  exportCalculationsJSON,
  exportCalculationsCSV,
  exportCalculationText,
} from '@/lib/storage'
import type { SavedCalculation } from '@/lib/storage'

const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const Historico = () => {
  const navigate = useNavigate()
  const [rows, setRows] = useState<SavedCalculation[]>([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(id)
  }, [search])

  const loadData = () => {
    const { data, total: t } = listCalculations({ page, pageSize, search: debouncedSearch })
    setRows(data)
    setTotal(t)
  }

  useEffect(() => {
    loadData()
  }, [page, pageSize, debouncedSearch])

  const handleDelete = (id: string, name: string) => {
    deleteCalculation(id)
    toast.success('Simulação excluída', { description: name })
    loadData()
  }

  const handleCopyText = (id: string) => {
    const text = exportCalculationText(id)
    if (text) {
      navigator.clipboard.writeText(text)
      toast.success('Resumo copiado para a área de transferência')
    }
  }

  const handleExportJSON = () => {
    const json = exportCalculationsJSON()
    downloadFile(json, 'margemforte_historico.json', 'application/json')
    toast.success('JSON exportado')
  }

  const handleExportCSV = () => {
    const csv = exportCalculationsCSV()
    if (!csv) {
      toast.error('Nenhuma simulação para exportar')
      return
    }
    downloadFile(csv, 'margemforte_historico.csv', 'text/csv')
    toast.success('CSV exportado')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-5xl mx-auto px-3 sm:p-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="hidden sm:flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Histórico</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportJSON} className="flex items-center gap-1">
              <Download className="h-3 w-3" /> JSON
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="flex items-center gap-1">
              <Download className="h-3 w-3" /> CSV
            </Button>
            <Button variant="default" onClick={() => navigate('/')} className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Nova simulação
            </Button>
          </div>
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
            {rows.length === 0 ? (
              <div className="text-sm text-muted-foreground">Nenhuma simulação salva ainda.</div>
            ) : (
              <div className="rounded-md border">
                <Table className="min-w-[640px] sm:min-w-[720px] md:min-w-0 md:w-full md:table-auto">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="md:w-[28%] md:px-3">Nome</TableHead>
                      <TableHead className="md:w-[14%] md:px-3">Modelo</TableHead>
                      <TableHead className="md:w-[14%] md:px-3">Criado em</TableHead>
                      <TableHead className="md:w-[14%] md:px-3">Valor do serviço</TableHead>
                      <TableHead className="md:w-[14%] md:px-3">Custo total</TableHead>
                      <TableHead className="md:w-[6%] md:px-3">Margem</TableHead>
                      <TableHead className="md:w-[10%] md:px-3 text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => {
                      const created = new Date(r.createdAt)
                      const createdFmt = created.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
                      return (
                        <TableRow key={r.id} className="cursor-pointer" onClick={() => navigate(`/?id=${r.id}`)}>
                          <TableCell className="md:p-3 align-top">
                            <div className="font-medium break-words whitespace-normal">{r.name || 'Sem nome'}</div>
                          </TableCell>
                          <TableCell className="md:p-3 align-top text-xs text-muted-foreground">{r.templateId}</TableCell>
                          <TableCell className="md:p-3 align-top whitespace-normal">{createdFmt}</TableCell>
                          <TableCell className="md:p-3 align-top break-all whitespace-normal text-right">{formatBRL(r.serviceValue)}</TableCell>
                          <TableCell className="md:p-3 align-top break-all whitespace-normal text-right">{formatBRL(r.totalCost)}</TableCell>
                          <TableCell className="md:p-3 align-top break-all whitespace-normal text-right">{r.actualMargin.toFixed(0)}%</TableCell>
                          <TableCell className="md:p-3 align-top text-right">
                            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleCopyText(r.id)}
                                aria-label="Copiar resumo"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="inline-flex items-center gap-1"
                                onClick={() => navigate(`/?id=${r.id}`)}
                                aria-label="Abrir Simulação"
                              >
                                <ExternalLink className="h-3 w-3" /> Abrir
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    aria-label="Excluir simulação"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Excluir simulação?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      A simulação "{r.name}" será excluída permanentemente.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(r.id, r.name)}>
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
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
