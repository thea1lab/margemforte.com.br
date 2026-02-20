const STORAGE_KEY = 'margemforte_calculations'

export type CostItemType = 'currency' | 'hours_rate' | 'quantity_price'

export interface SavedCostItem {
  id: string
  label: string
  type: CostItemType
  /** For currency: the value in BRL. For hours_rate: hours. For quantity_price: quantity. */
  value: number
  /** For hours_rate: rate per hour. For quantity_price: unit price. Unused for currency. */
  rate: number
}

export interface SavedCalculation {
  id: string
  name: string
  templateId: string
  costItems: SavedCostItem[]
  serviceValue: number
  desiredMargin: number
  // Computed results stored for display in history
  totalCost: number
  minimumPrice: number
  actualMargin: number
  maxDiscount: number
  createdAt: string
  updatedAt: string
}

function readAll(): SavedCalculation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeAll(calculations: SavedCalculation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(calculations))
  } catch (e) {
    console.error('localStorage write failed (possibly full):', e)
    throw new Error('Não foi possível salvar. O armazenamento local pode estar cheio.')
  }
}

export function saveCalculation(
  data: Omit<SavedCalculation, 'id' | 'createdAt' | 'updatedAt'>
): SavedCalculation {
  const all = readAll()
  const now = new Date().toISOString()
  const calc: SavedCalculation = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  }
  all.unshift(calc)
  writeAll(all)
  return calc
}

export function updateCalculation(
  id: string,
  data: Partial<Omit<SavedCalculation, 'id' | 'createdAt'>>
): SavedCalculation | null {
  const all = readAll()
  const idx = all.findIndex((c) => c.id === id)
  if (idx === -1) return null
  all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() }
  writeAll(all)
  return all[idx]
}

export function getCalculation(id: string): SavedCalculation | null {
  return readAll().find((c) => c.id === id) ?? null
}

export function listCalculations(params?: {
  search?: string
  page?: number
  pageSize?: number
}): { data: SavedCalculation[]; total: number } {
  let all = readAll()
  if (params?.search) {
    const q = params.search.toLowerCase()
    all = all.filter((c) => c.name.toLowerCase().includes(q))
  }
  const total = all.length
  if (params?.page && params?.pageSize) {
    const start = (params.page - 1) * params.pageSize
    all = all.slice(start, start + params.pageSize)
  }
  return { data: all, total }
}

export function deleteCalculation(id: string): boolean {
  const all = readAll()
  const filtered = all.filter((c) => c.id !== id)
  if (filtered.length === all.length) return false
  writeAll(filtered)
  return true
}

export function exportCalculationsJSON(): string {
  return JSON.stringify(readAll(), null, 2)
}

export function exportCalculationsCSV(): string {
  const all = readAll()
  if (all.length === 0) return ''
  const header = 'Nome,Template,Valor do Serviço,Custo Total,Margem Desejada,Margem Real,Preço Mínimo,Desconto Máximo,Criado em'
  const rows = all.map((c) =>
    [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.templateId}"`,
      c.serviceValue.toFixed(2),
      c.totalCost.toFixed(2),
      c.desiredMargin.toFixed(2),
      c.actualMargin.toFixed(2),
      isFinite(c.minimumPrice) ? c.minimumPrice.toFixed(2) : 'indefinido',
      isFinite(c.maxDiscount) ? c.maxDiscount.toFixed(2) : 'indefinido',
      c.createdAt,
    ].join(',')
  )
  return [header, ...rows].join('\n')
}

export function exportCalculationText(id: string): string | null {
  const c = getCalculation(id)
  if (!c) return null
  const formatBRL = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
  const lines = [
    `Simulação: ${c.name}`,
    `Modelo: ${c.templateId}`,
    ``,
    `Itens de custo:`,
    ...c.costItems.map((item) => {
      if (item.type === 'currency') return `  - ${item.label}: ${formatBRL(item.value)}`
      if (item.type === 'hours_rate') return `  - ${item.label}: ${item.value}h x ${formatBRL(item.rate)} = ${formatBRL(item.value * item.rate)}`
      return `  - ${item.label}: ${item.value} x ${formatBRL(item.rate)} = ${formatBRL(item.value * item.rate)}`
    }),
    ``,
    `Custo total: ${formatBRL(c.totalCost)}`,
    `Valor do serviço: ${formatBRL(c.serviceValue)}`,
    `Margem desejada: ${c.desiredMargin.toFixed(1)}%`,
    `Margem real: ${c.actualMargin.toFixed(2)}%`,
    `Preço mínimo: ${isFinite(c.minimumPrice) ? formatBRL(c.minimumPrice) : 'indefinido'}`,
    `Desconto máximo: ${isFinite(c.maxDiscount) ? c.maxDiscount.toFixed(2) + '%' : 'indefinido'}`,
    ``,
    `Criado em: ${new Date(c.createdAt).toLocaleString('pt-BR')}`,
  ]
  return lines.join('\n')
}
