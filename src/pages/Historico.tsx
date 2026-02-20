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

function getMarginBadgeClasses(margin: number): string {
  if (margin >= 20) return 'bg-success/10 text-success border-success/20'
  if (margin >= 10) return 'bg-warning/10 text-warning-foreground border-warning/20'
  return 'bg-destructive/10 text-destructive border-destructive/20'
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
    <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
              <History className="h-7 w-7 text-primary" />
              Histórico
            </h2>
            <p className="text-muted-foreground text-sm mt-1">Suas simulações salvas</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportJSON} className="flex items-center gap-1 rounded-full">
              <Download className="h-3 w-3" /> JSON
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="flex items-center gap-1 rounded-full">
              <Download className="h-3 w-3" /> CSV
            </Button>
            <Button variant="default" onClick={() => navigate('/')} className="flex items-center gap-2 rounded-full">
              <Plus className="h-4 w-4" /> Nova simulação
            </Button>
          </div>
        </div>

        {/* Card with accent bar */}
        <Card className="border-0 rounded-2xl shadow-medium overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary via-primary-light to-accent-warm" />

          <CardHeader className="px-5 sm:px-8 pt-6 pb-2">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <CardTitle className="text-base font-semibold">Simulações salvas</CardTitle>
              <div className="w-full md:max-w-xs">
                <Input
                  placeholder="Buscar por nome da simulação..."
                  value={search}
                  onChange={(e) => { setPage(1); setSearch(e.target.value) }}
                  className="rounded-xl"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-5 sm:px-8 pb-6">
            {rows.length === 0 ? (
              <div className="text-sm text-muted-foreground py-8 text-center">Nenhuma simulação salva ainda.</div>
            ) : (
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <Table className="min-w-[640px] sm:min-w-[720px] md:min-w-0 md:w-full md:table-auto">
                  <TableHeader>
                    <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                      <TableHead className="md:w-[28%] md:px-4 uppercase tracking-wider text-xs font-semibold">Nome</TableHead>
                      <TableHead className="md:w-[14%] md:px-4 uppercase tracking-wider text-xs font-semibold">Modelo</TableHead>
                      <TableHead className="md:w-[14%] md:px-4 uppercase tracking-wider text-xs font-semibold">Criado em</TableHead>
                      <TableHead className="md:w-[14%] md:px-4 uppercase tracking-wider text-xs font-semibold">Valor do serviço</TableHead>
                      <TableHead className="md:w-[14%] md:px-4 uppercase tracking-wider text-xs font-semibold">Custo total</TableHead>
                      <TableHead className="md:w-[6%] md:px-4 uppercase tracking-wider text-xs font-semibold">Margem</TableHead>
                      <TableHead className="md:w-[10%] md:px-4 text-right uppercase tracking-wider text-xs font-semibold">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => {
                      const created = new Date(r.createdAt)
                      const createdFmt = created.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
                      return (
                        <TableRow key={r.id} className="cursor-pointer hover:bg-secondary/30 border-border/40" onClick={() => navigate(`/?id=${r.id}`)}>
                          <TableCell className="md:p-4 align-top">
                            <div className="font-medium break-words whitespace-normal">{r.name || 'Sem nome'}</div>
                          </TableCell>
                          <TableCell className="md:p-4 align-top text-xs text-muted-foreground">{r.templateId}</TableCell>
                          <TableCell className="md:p-4 align-top whitespace-normal text-sm">{createdFmt}</TableCell>
                          <TableCell className="md:p-4 align-top break-all whitespace-normal text-right text-sm">{formatBRL(r.serviceValue)}</TableCell>
                          <TableCell className="md:p-4 align-top break-all whitespace-normal text-right text-sm">{formatBRL(r.totalCost)}</TableCell>
                          <TableCell className="md:p-4 align-top text-right">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-semibold ${getMarginBadgeClasses(r.actualMargin)}`}>
                              {r.actualMargin.toFixed(0)}%
                            </span>
                          </TableCell>
                          <TableCell className="md:p-4 align-top text-right">
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
            <div className="mt-4 space-y-3">
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
