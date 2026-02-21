import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button-variants'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Calculator,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  HelpCircle,
  Save,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Wrench,
  CakeSlice,
  Briefcase,
  Palette,
  Monitor,
  Settings,
  Info,
  Receipt,
  Building2,
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { BlockMath } from 'react-katex'
import { toast } from '@/components/ui/sonner'
import { useLocation, useNavigate } from 'react-router-dom'
import { templates, getTemplate } from '@/lib/templates'
import type { Template } from '@/lib/templates'
import { saveCalculation, updateCalculation, getCalculation } from '@/lib/storage'
import type { CostItemType } from '@/lib/storage'
import { calculateMargin as calcMargin } from '@/lib/margin-math'
import type { MarginResult } from '@/lib/margin-math'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const iconMap: Record<string, React.ElementType> = {
  Wrench,
  CakeSlice,
  Briefcase,
  Palette,
  Monitor,
  Settings,
}

const TAX_REGIMES = [
  { id: 'none', label: 'Sem imposto', rate: 0 },
  { id: 'mei', label: 'MEI', rate: 5.0 },
  { id: 'simples_6', label: 'Simples (Anexo III)', rate: 6.0 },
  { id: 'simples_11', label: 'Simples (Anexo V)', rate: 15.5 },
  { id: 'lucro_presumido', label: 'Lucro Presumido', rate: 16.33 },
  { id: 'custom', label: 'Personalizado', rate: null },
]

interface CostItem {
  id: string
  label: string
  type: CostItemType
  value: string
  rate: string
}

type CalculationResult = MarginResult & { actualMargin: number }

function costItemValue(item: CostItem, parseCurrency: (v: string) => number): number {
  if (item.type === 'currency') return parseCurrency(item.value)
  if (item.type === 'hours_rate') return (Number(item.value) || 0) * parseCurrency(item.rate)
  return (Number(item.value) || 0) * parseCurrency(item.rate)
}

export const MarginCalculator = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [costItems, setCostItems] = useState<CostItem[]>([])
  const [serviceValue, setServiceValue] = useState('')
  const [desiredMargin, setDesiredMargin] = useState('20')
  const [taxRate, setTaxRate] = useState('0')
  const [taxRegime, setTaxRegime] = useState('none')
  const [fixedCostMonthly, setFixedCostMonthly] = useState('')
  const [jobsPerMonth, setJobsPerMonth] = useState('10')
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [simulationName, setSimulationName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)
  const [hasSavedOnce, setHasSavedOnce] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [simulationId, setSimulationId] = useState<string | null>(null)
  const [showAddItem, setShowAddItem] = useState(false)
  const [newItemLabel, setNewItemLabel] = useState('')
  const [newItemType, setNewItemType] = useState<CostItemType>('currency')

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const id = params.get('id')
    if (id) {
      setSimulationId(id)
      const data = getCalculation(id)
      if (data) {
        setSimulationName(data.name)
        setServiceValue(formatNumberToInput(data.serviceValue))
        setDesiredMargin(String(data.desiredMargin))
        const tpl = getTemplate(data.templateId)
        setSelectedTemplate(tpl ?? templates[templates.length - 1])
        setCostItems(
          data.costItems.map((ci) => ({
            id: ci.id,
            label: ci.label,
            type: ci.type,
            value: ci.type === 'currency' ? formatNumberToInput(ci.value) : String(ci.value || ''),
            rate: ci.type !== 'currency' ? formatNumberToInput(ci.rate) : '',
          }))
        )
        // Restore new fields with defaults
        setTaxRate(String(data.taxRate ?? 0))
        setTaxRegime(data.taxRegime ?? 'none')
        setFixedCostMonthly(data.fixedCostMonthly ? formatNumberToInput(data.fixedCostMonthly) : '')
        setJobsPerMonth(String(data.jobsPerMonth ?? 10))
        setHasSavedOnce(true)
        setHasUnsavedChanges(false)
      } else {
        toast.error('Simulação não encontrada', {
          description: 'Verifique o link ou tente novamente.',
        })
      }
    }
  }, [location.search])

  const formatCurrency = (value: string): string => {
    const numericValue = value.replace(/\D/g, '')
    return new Intl.NumberFormat('pt-BR', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(numericValue) / 100)
  }

  const parseCurrency = (value: string): number => {
    return Number(value.replace(/\D/g, '')) / 100
  }

  const formatNumberToInput = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value) || 0)
  }

  const formatBRL = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const markUnsaved = () => {
    if (hasSavedOnce && !hasUnsavedChanges) {
      setHasUnsavedChanges(true)
    }
  }

  const handleServiceValueChange = (value: string) => {
    setServiceValue(formatCurrency(value))
    markUnsaved()
  }

  const handleMarginChange = (value: string) => {
    setDesiredMargin(value)
    markUnsaved()
  }

  const handleTaxRegimeChange = (regimeId: string) => {
    setTaxRegime(regimeId)
    const regime = TAX_REGIMES.find((r) => r.id === regimeId)
    if (regime && regime.rate !== null) {
      setTaxRate(String(regime.rate))
    }
    markUnsaved()
  }

  const handleTaxRateChange = (value: string) => {
    const numVal = value.replace(/[^0-9.,]/g, '').replace(',', '.')
    setTaxRate(numVal)
    // If manually editing, check if it matches a preset
    const num = Number(numVal)
    const match = TAX_REGIMES.find((r) => r.rate === num)
    if (match) {
      setTaxRegime(match.id)
    } else if (num === 0) {
      setTaxRegime('none')
    } else {
      setTaxRegime('custom')
    }
    markUnsaved()
  }

  const handleFixedCostChange = (value: string) => {
    setFixedCostMonthly(formatCurrency(value))
    markUnsaved()
  }

  const handleJobsPerMonthChange = (value: string) => {
    setJobsPerMonth(value)
    markUnsaved()
  }

  const handleCostItemChange = (id: string, field: 'label' | 'value' | 'rate', value: string) => {
    setCostItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        if (field === 'value') {
          if (item.type === 'currency') return { ...item, value: formatCurrency(value) }
          return { ...item, value }
        }
        if (field === 'rate') return { ...item, rate: formatCurrency(value) }
        return { ...item, [field]: value }
      })
    )
    markUnsaved()
  }

  const removeCostItem = (id: string) => {
    setCostItems((prev) => prev.filter((item) => item.id !== id))
    markUnsaved()
  }

  const addCostItem = () => {
    if (!newItemLabel.trim()) return
    setCostItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        label: newItemLabel.trim(),
        type: newItemType,
        value: '',
        rate: '',
      },
    ])
    setNewItemLabel('')
    setNewItemType('currency')
    setShowAddItem(false)
    markUnsaved()
  }

  const selectTemplate = (tpl: Template) => {
    setSelectedTemplate(tpl)
    setCostItems(
      tpl.defaultCostItems.map((di) => ({
        id: crypto.randomUUID(),
        label: di.label,
        type: di.type,
        value: '',
        rate: '',
      }))
    )
    setServiceValue('')
    setDesiredMargin('20')
    setSimulationName('')
    setSimulationId(null)
    setHasSavedOnce(false)
    setHasUnsavedChanges(false)
    setFixedCostMonthly('')
    setJobsPerMonth('10')
    // Apply suggested tax regime from template
    if (tpl.suggestedTaxRegime) {
      handleTaxRegimeChange(tpl.suggestedTaxRegime)
    } else {
      setTaxRegime('none')
      setTaxRate('0')
    }
    navigate('/', { replace: true })
  }

  const goBackToTemplates = () => {
    setSelectedTemplate(null)
    setCostItems([])
    setServiceValue('')
    setDesiredMargin('20')
    setResult(null)
    setSimulationName('')
    setNameError(null)
    setHasUnsavedChanges(false)
    setHasSavedOnce(false)
    setSimulationId(null)
    setTaxRate('0')
    setTaxRegime('none')
    setFixedCostMonthly('')
    setJobsPerMonth('10')
    navigate('/', { replace: true })
  }

  const calculateMargin = (): CalculationResult => {
    const result = calcMargin({
      serviceValue: parseCurrency(serviceValue),
      variableCost: costItems.reduce((sum, item) => sum + costItemValue(item, parseCurrency), 0),
      fixedCostMonthly: parseCurrency(fixedCostMonthly),
      jobsPerMonth: Number(jobsPerMonth) || 1,
      desiredMargin: Number(desiredMargin) || 0,
      taxRate: Number(taxRate) || 0,
    })
    return { ...result, actualMargin: result.grossMargin }
  }

  useEffect(() => {
    if (parseCurrency(serviceValue) > 0) {
      setResult(calculateMargin())
    } else {
      setResult(null)
    }
  }, [serviceValue, desiredMargin, costItems, taxRate, fixedCostMonthly, jobsPerMonth])

  const handleSave = () => {
    if (!result) return
    if (!simulationName.trim()) {
      setNameError('Campo obrigatório')
      document.getElementById('simulationName')?.focus()
      return
    }
    try {
      setIsSaving(true)
      const currentTaxRate = Math.min(100, Math.max(0, Number(taxRate) || 0))
      const payload = {
        name: simulationName.trim(),
        templateId: selectedTemplate?.id ?? 'personalizado',
        costItems: costItems.map((ci) => ({
          id: ci.id,
          label: ci.label,
          type: ci.type,
          value: ci.type === 'currency' ? parseCurrency(ci.value) : Number(ci.value) || 0,
          rate: ci.type !== 'currency' ? parseCurrency(ci.rate) : 0,
        })),
        serviceValue: parseCurrency(serviceValue),
        desiredMargin: Math.min(100, Math.max(0, Number(desiredMargin) || 0)),
        totalCost: result.totalCost,
        minimumPrice: result.minimumPrice,
        actualMargin: result.grossMargin,
        maxDiscount: result.maxDiscount,
        taxRate: currentTaxRate,
        taxRegime,
        fixedCostMonthly: parseCurrency(fixedCostMonthly),
        jobsPerMonth: Number(jobsPerMonth) || 10,
        fixedCostPerJob: result.fixedPerJob,
        taxAmount: result.taxAmount,
        netMargin: result.netMargin,
      }

      if (simulationId) {
        updateCalculation(simulationId, payload)
      } else {
        const saved = saveCalculation(payload)
        if (saved?.id) {
          const params = new URLSearchParams(location.search)
          params.set('id', saved.id)
          navigate({ pathname: location.pathname, search: params.toString() }, { replace: true })
          setSimulationId(saved.id)
        }
      }
      toast.success('Simulação salva com sucesso', {
        description: simulationName || 'A simulação foi salva no histórico.',
      })
      setHasSavedOnce(true)
      setHasUnsavedChanges(false)
    } catch (err) {
      console.error(err)
      toast.error('Não foi possível salvar', { description: 'Tente novamente em instantes.' })
    } finally {
      setIsSaving(false)
    }
  }

  const resetForm = () => {
    if (selectedTemplate) {
      selectTemplate(selectedTemplate)
    }
  }

  const getStatusIcon = (status: CalculationResult['status']) => {
    switch (status) {
      case 'safe': return <CheckCircle2 className="h-5 w-5" />
      case 'warning': return <AlertTriangle className="h-5 w-5" />
      case 'danger': return <AlertTriangle className="h-5 w-5" />
      default: return <Calculator className="h-5 w-5" />
    }
  }

  const getStatusBg = (status: CalculationResult['status']) => {
    switch (status) {
      case 'safe': return 'bg-success/10 border-success/20 text-success'
      case 'warning': return 'bg-warning/10 border-warning/20 text-warning-foreground'
      case 'danger': return 'bg-destructive/10 border-destructive/20 text-destructive'
      default: return 'bg-secondary'
    }
  }

  const getMarginColor = (status: CalculationResult['status']) => {
    switch (status) {
      case 'safe': return 'text-success'
      case 'warning': return 'text-warning-foreground'
      case 'danger': return 'text-destructive'
      default: return 'text-foreground'
    }
  }

  const getMarginBg = (status: CalculationResult['status']) => {
    switch (status) {
      case 'safe': return 'bg-success/10'
      case 'warning': return 'bg-warning/10'
      case 'danger': return 'bg-destructive/10'
      default: return 'bg-secondary/40'
    }
  }

  const getNumberSizeClasses = (text: string): string => {
    const length = text.replace(/[\s\u00A0]/g, '').length
    if (length <= 12) return 'text-3xl sm:text-4xl md:text-5xl'
    if (length <= 18) return 'text-2xl sm:text-3xl md:text-4xl'
    if (length <= 24) return 'text-xl sm:text-2xl md:text-3xl'
    return 'text-lg sm:text-xl md:text-2xl'
  }

  const getSmallNumberSizeClasses = (text: string): string => {
    const length = text.replace(/[\s\u00A0]/g, '').length
    if (length <= 12) return 'text-base md:text-lg'
    if (length <= 18) return 'text-sm md:text-base'
    if (length <= 24) return 'text-xs md:text-sm'
    return 'text-[10px] md:text-xs'
  }

  const renderBreakable = (text: string): JSX.Element => {
    const dotParts = text.split('.')
    const nodes: Array<string | JSX.Element> = []
    dotParts.forEach((segment, idx) => {
      if (idx > 0) {
        nodes.push('.')
        nodes.push(<wbr key={`w-dot-${idx}`} />)
      }
      const pctIndex = segment.indexOf('%')
      if (pctIndex >= 0) {
        const before = segment.slice(0, pctIndex)
        const after = segment.slice(pctIndex + 1)
        if (before) nodes.push(before)
        nodes.push(<wbr key={`w-pct-${idx}`} />)
        nodes.push('%')
        if (after) nodes.push(after)
      } else {
        nodes.push(segment)
      }
    })
    return <>{nodes}</>
  }

  const MarginPreset = ({ value }: { value: number }) => (
    <button
      type="button"
      onClick={() => handleMarginChange(String(value))}
      className={`px-3 py-1 rounded-full border text-xs font-medium transition ${
        Number(desiredMargin) === value
          ? 'bg-primary text-white border-primary'
          : 'hover:bg-muted border-border'
      }`}
      tabIndex={-1}
      aria-hidden="true"
      aria-label={`Definir margem em ${value}%`}
    >
      {value}%
    </button>
  )

  const TaxPreset = ({ regime }: { regime: typeof TAX_REGIMES[number] }) => (
    <button
      type="button"
      onClick={() => handleTaxRegimeChange(regime.id)}
      className={`px-3 py-1 rounded-full border text-xs font-medium transition ${
        taxRegime === regime.id
          ? 'bg-primary text-white border-primary'
          : 'hover:bg-muted border-border'
      }`}
      tabIndex={-1}
      aria-hidden="true"
      aria-label={`Selecionar ${regime.label}`}
    >
      {regime.label}
    </button>
  )

  const typeLabel = (type: CostItemType) => {
    switch (type) {
      case 'currency': return 'Valor (R$)'
      case 'hours_rate': return 'Horas x R$/h'
      case 'quantity_price': return 'Qtd x Preço unit.'
    }
  }

  // ─── Template selection screen ─────────────────────────────────
  if (!selectedTemplate) {
    return (
      <div className="space-y-8">
        {/* Hero section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(235,55%,20%)] via-[hsl(245,50%,30%)] to-[hsl(255,45%,35%)] px-6 py-12 sm:px-10 sm:py-16 md:py-20 text-center">
          {/* Decorative circles */}
          <div className="absolute top-[-60px] right-[-40px] w-[200px] h-[200px] rounded-full bg-white/5" />
          <div className="absolute bottom-[-80px] left-[-60px] w-[250px] h-[250px] rounded-full bg-white/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-white/[0.02]" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur text-white/90 text-sm font-medium mb-6">
              <Calculator className="h-4 w-4" />
              Calculadora de Margem
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Calcule sua margem<br className="hidden sm:block" /> de forma inteligente
            </h2>
            <p className="text-white/70 mt-4 text-base sm:text-lg max-w-2xl mx-auto">
              Descubra a margem real do seu negócio - com custos fixos, variáveis e impostos
            </p>
          </div>
        </div>

        {/* SEO intro text */}
        <section className="mb-6">
          <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-3xl">
            Calcule a margem de lucro real do seu negócio de forma rápida e gratuita.
            Inclua custos fixos, variáveis e impostos (MEI, Simples Nacional, Lucro Presumido)
            para descobrir o preço mínimo de venda, o desconto máximo e o lucro líquido por serviço.
            Ideal para prestadores de serviço, confeiteiros, artesãos, freelancers e consultores.
          </p>
        </section>

        {/* Template cards */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Selecione seu modelo
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((tpl) => {
              const Icon = iconMap[tpl.icon] ?? Settings
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => selectTemplate(tpl)}
                  className="relative flex flex-col items-start text-left gap-3 p-6 sm:p-7 border rounded-2xl bg-white hover:border-primary/40 hover:shadow-medium transition-all group cursor-pointer"
                >
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:from-primary/15 group-hover:to-primary/10 transition-colors">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{tpl.name}</div>
                    <div className="text-sm text-muted-foreground mt-1">{tpl.description}</div>
                  </div>
                  {tpl.defaultCostItems.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {tpl.defaultCostItems.map((ci) => (
                        <Badge key={ci.label} variant="secondary" className="text-[10px] rounded-md">
                          {ci.label}
                        </Badge>
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ─── Calculator screen ─────────────────────────────────────────
  const serviceValueNumber = parseCurrency(serviceValue)
  const fixedMonthlyNumber = parseCurrency(fixedCostMonthly)
  const jobsNumber = Math.max(1, Number(jobsPerMonth) || 1)
  const fixedPerJobNumber = fixedMonthlyNumber / jobsNumber
  const variableCostNumber = costItems.reduce((sum, item) => sum + costItemValue(item, parseCurrency), 0)
  const totalCostNumber = variableCostNumber + fixedPerJobNumber

  const minimumPriceDisplay = result && isFinite(result.minimumPrice) ? formatBRL(result.minimumPrice) : ''
  const minPriceTextClass = minimumPriceDisplay ? getNumberSizeClasses(minimumPriceDisplay) : 'text-3xl sm:text-4xl md:text-5xl'
  const netMarginDisplay = result ? `${result.netMargin.toFixed(2)}%` : ''
  const netMarginTextClass = netMarginDisplay ? getNumberSizeClasses(netMarginDisplay) : 'text-3xl sm:text-4xl md:text-5xl'
  const maxDiscountDisplay = result && isFinite(result.maxDiscount) ? `${result.maxDiscount.toFixed(2)}%` : ''
  const maxDiscountTextClass = maxDiscountDisplay ? getNumberSizeClasses(maxDiscountDisplay) : 'text-3xl sm:text-4xl md:text-5xl'

  const netProfitValue = result ? (serviceValueNumber - result.totalCost - result.taxAmount) : 0
  const netProfitDisplay = result ? formatBRL(Math.max(0, netProfitValue)) : ''
  const netProfitTextClass = netProfitDisplay ? getSmallNumberSizeClasses(netProfitDisplay) : 'text-base md:text-lg'
  const taxAmountDisplay = result ? formatBRL(result.taxAmount) : ''
  const taxAmountTextClass = taxAmountDisplay ? getSmallNumberSizeClasses(taxAmountDisplay) : 'text-base md:text-lg'
  const totalCostDisplay = result ? formatBRL(result.totalCost) : ''
  const totalCostTextClass = totalCostDisplay ? getSmallNumberSizeClasses(totalCostDisplay) : 'text-base md:text-lg'
  const serviceValueDisplay = result ? formatBRL(serviceValueNumber) : ''
  const serviceValueTextClass = serviceValueDisplay ? getSmallNumberSizeClasses(serviceValueDisplay) : 'text-base md:text-lg'

  const currentTaxRateNum = Math.min(100, Math.max(0, Number(taxRate) || 0))

  return (
    <div className="space-y-8 mx-auto scroll-smooth">
      {/* Main calculator card */}
      <Card className="border-0 rounded-2xl shadow-medium overflow-hidden">
        {/* Accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-primary via-primary-light to-accent-warm" />

        <CardHeader className="px-5 sm:px-8 pt-8 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <button
                type="button"
                onClick={goBackToTemplates}
                className="text-xs text-primary hover:underline flex items-center gap-1 mb-2"
              >
                <ArrowLeft className="h-3 w-3" /> Trocar modelo
              </button>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground">
                Calculadora de Margem
              </CardTitle>
              <Badge variant="secondary" className="text-xs mt-2">
                {selectedTemplate.name}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-5 sm:px-8 pb-8 space-y-8">
          {/* Valor do Serviço */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="serviceValue" className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                Preço cobrado do cliente
              </Label>
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-muted-foreground hover:text-foreground" tabIndex={-1} aria-hidden="true">
                      <HelpCircle className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs text-left">
                    Quanto você vai cobrar pelo serviço ou produto.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="relative max-w-md">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">R$</span>
              <Input
                id="serviceValue"
                placeholder="0,00"
                value={serviceValue}
                onChange={(e) => handleServiceValueChange(e.target.value)}
                className="pl-12 h-14 text-xl font-semibold rounded-xl border-2"
                inputMode="numeric"
              />
            </div>
          </div>

          {/* Margem desejada */}
          <div className="p-5 sm:p-6 bg-secondary/50 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <Label htmlFor="desiredMargin" className="text-sm font-medium">
                    Margem desejada
                  </Label>
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className="text-muted-foreground hover:text-foreground" tabIndex={-1} aria-hidden="true">
                          <HelpCircle className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-left">
                        Percentual de lucro-alvo. Usada para calcular o preço mínimo e o desconto máximo. Não altera a sua margem atual.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Slider
                  value={[Number(desiredMargin) || 0]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={(v) => handleMarginChange(String(v[0]))}
                  aria-label="Margem desejada"
                />
                <div className="flex flex-wrap gap-2">
                  {[10, 20, 30, 40, 50, 60].map((p) => (
                    <MarginPreset key={p} value={p} />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Recomendado: 30% a 50%.</p>
              </div>
              <div className="text-center sm:text-right">
                <span className="text-2xl font-bold text-primary">{desiredMargin}%</span>
              </div>
            </div>
          </div>

          {/* Impostos */}
          <div className="p-5 sm:p-6 bg-secondary/50 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                    Impostos sobre o serviço
                  </Label>
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className="text-muted-foreground hover:text-foreground" tabIndex={-1} aria-hidden="true">
                          <HelpCircle className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-left">
                        Percentual de impostos sobre o valor do serviço. Consulte seu contador para a alíquota exata.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TAX_REGIMES.filter((r) => r.id !== 'custom').map((regime) => (
                    <TaxPreset key={regime.id} regime={regime} />
                  ))}
                </div>
                {taxRegime === 'custom' && (
                  <div className="relative max-w-[200px]">
                    <Input
                      placeholder="0,00"
                      value={taxRate}
                      onChange={(e) => handleTaxRateChange(e.target.value)}
                      className="pr-8"
                      inputMode="decimal"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Selecione seu regime tributário ou informe a alíquota manualmente.</p>
              </div>
              <div className="text-center sm:text-right">
                <span className="text-2xl font-bold text-primary">{currentTaxRateNum}%</span>
              </div>
            </div>
          </div>

          {/* Custos fixos */}
          <div className="p-5 sm:p-6 bg-secondary/50 rounded-xl space-y-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                Custos fixos mensais
              </Label>
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-muted-foreground hover:text-foreground" tabIndex={-1} aria-hidden="true">
                      <HelpCircle className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs text-left">
                    Custos que você paga todo mês independente de quantos serviços faz. Ex: aluguel, energia, internet, contador.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-xs text-muted-foreground">Total de custos fixos mensais</span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                  <Input
                    placeholder="0,00"
                    value={fixedCostMonthly}
                    onChange={(e) => handleFixedCostChange(e.target.value)}
                    className="pl-10"
                    inputMode="numeric"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">Quantos serviços/vendas por mês?</span>
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className="text-muted-foreground hover:text-foreground" tabIndex={-1} aria-hidden="true">
                          <HelpCircle className="h-3.5 w-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-left">
                        Quantos serviços ou vendas você faz por mês, em média. Usado para dividir os custos fixos por cada serviço.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="10"
                  value={jobsPerMonth}
                  onChange={(e) => handleJobsPerMonthChange(e.target.value)}
                />
              </div>
            </div>
            {fixedMonthlyNumber > 0 && (
              <div className="text-sm font-medium text-primary">
                Custo fixo por serviço: {formatBRL(fixedPerJobNumber)}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {selectedTemplate.suggestedFixedCosts && selectedTemplate.suggestedFixedCosts.length > 0
                ? `Inclua: ${selectedTemplate.suggestedFixedCosts.join(', ')}, etc.`
                : 'Inclua aluguel, energia, internet, contador, seguros, etc.'}
            </p>
          </div>

          {/* Educational banner */}
          <div className="flex gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800">
            <Info className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="text-sm">
              Para calcular sua margem real, preencha <strong>todos</strong> os campos: o preço cobrado, os custos de cada serviço, seus gastos fixos do mês e os impostos.
            </p>
          </div>

          {/* Cost items */}
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Custos por serviço (variáveis)</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Quanto você gasta para fazer <strong>cada</strong> serviço ou produto.</p>
            </div>
            {costItems.map((item) => (
              <div key={item.id} className="p-4 sm:p-5 bg-secondary/30 rounded-xl border border-border/50">
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-2">
                    <Input
                      value={item.label}
                      onChange={(e) => handleCostItemChange(item.id, 'label', e.target.value)}
                      className="font-medium text-sm h-8"
                      placeholder="Nome do item"
                    />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-[10px]">{typeLabel(item.type)}</Badge>
                    </div>
                    {item.type === 'currency' && (
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                        <Input
                          placeholder="0,00"
                          value={item.value}
                          onChange={(e) => handleCostItemChange(item.id, 'value', e.target.value)}
                          className="pl-10"
                          inputMode="numeric"
                        />
                      </div>
                    )}
                    {item.type === 'hours_rate' && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-xs text-muted-foreground">Horas</span>
                          <Input
                            type="number"
                            step="1"
                            min="0"
                            placeholder="0"
                            value={item.value}
                            onChange={(e) => handleCostItemChange(item.id, 'value', e.target.value)}
                          />
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">R$/h</span>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                            <Input
                              placeholder="0,00"
                              value={item.rate}
                              onChange={(e) => handleCostItemChange(item.id, 'rate', e.target.value)}
                              className="pl-10"
                              inputMode="numeric"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    {item.type === 'quantity_price' && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-xs text-muted-foreground">Quantidade</span>
                          <Input
                            type="number"
                            step="1"
                            min="0"
                            placeholder="0"
                            value={item.value}
                            onChange={(e) => handleCostItemChange(item.id, 'value', e.target.value)}
                          />
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Preço unit.</span>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                            <Input
                              placeholder="0,00"
                              value={item.rate}
                              onChange={(e) => handleCostItemChange(item.id, 'rate', e.target.value)}
                              className="pl-10"
                              inputMode="numeric"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive shrink-0 mt-1"
                    onClick={() => removeCostItem(item.id)}
                    aria-label={`Remover ${item.label}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {showAddItem ? (
              <div className="p-4 sm:p-5 bg-secondary/30 rounded-xl border border-border/50 space-y-2">
                <Input
                  placeholder="Nome do item de custo"
                  value={newItemLabel}
                  onChange={(e) => setNewItemLabel(e.target.value)}
                  autoFocus
                />
                <Select value={newItemType} onValueChange={(v) => setNewItemType(v as CostItemType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="currency">Valor (R$)</SelectItem>
                    <SelectItem value="hours_rate">Horas x R$/h</SelectItem>
                    <SelectItem value="quantity_price">Qtd x Preço unit.</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button size="sm" onClick={addCostItem} disabled={!newItemLabel.trim()}>
                    Adicionar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setShowAddItem(false); setNewItemLabel('') }}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full flex items-center gap-2 border-dashed border-2 h-12 rounded-xl hover:bg-secondary/30"
                onClick={() => setShowAddItem(true)}
              >
                <Plus className="h-4 w-4" /> Adicionar item de custo
              </Button>
            )}
          </div>

          {/* Cost summary */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/10 p-5 sm:p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {costItems.map((item) => {
                const val = costItemValue(item, parseCurrency)
                const display = item.type === 'currency'
                  ? formatBRL(val)
                  : item.type === 'hours_rate'
                    ? `${Number(item.value) || 0}h x ${formatBRL(parseCurrency(item.rate))}`
                    : `${Number(item.value) || 0} x ${formatBRL(parseCurrency(item.rate))}`
                return (
                  <div key={item.id} className="space-y-0.5">
                    <span className="text-xs text-muted-foreground truncate block">{item.label}</span>
                    <span className="text-sm font-medium break-words">{renderBreakable(display)}</span>
                  </div>
                )
              })}
              {fixedPerJobNumber > 0 && (
                <div className="space-y-0.5">
                  <span className="text-xs text-muted-foreground">Custo fixo/serviço</span>
                  <span className="text-sm font-medium block">{renderBreakable(formatBRL(fixedPerJobNumber))}</span>
                </div>
              )}
              <div className="space-y-0.5 col-span-2 md:col-span-1">
                <span className="text-xs text-muted-foreground">Custo total</span>
                <span className="text-sm font-bold block">{renderBreakable(formatBRL(totalCostNumber))}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={resetForm}>Limpar</Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card className="border-0 rounded-2xl shadow-medium overflow-hidden animate-fade-in">
          {/* Status banner */}
          <div className={`px-5 sm:px-8 py-4 flex items-center gap-3 border-b ${getStatusBg(result.status)}`}>
            {getStatusIcon(result.status)}
            <span className="font-semibold text-sm sm:text-base">{result.message}</span>
          </div>

          <CardContent className="px-5 sm:px-8 py-8 space-y-8">
            {/* 3 metric cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Preço mínimo */}
              <div className="p-6 rounded-xl bg-secondary/40 text-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Preço mínimo
                </span>
                <div className={`${minPriceTextClass} font-extrabold text-primary mt-2 break-words`}>
                  {isFinite(result.minimumPrice) ? renderBreakable(minimumPriceDisplay) : 'indefinido'}
                </div>
                <span className="text-xs text-muted-foreground mt-1 block">
                  com margem de {desiredMargin}%{currentTaxRateNum > 0 ? ` + ${currentTaxRateNum}% impostos` : ''}
                </span>
              </div>

              {/* Margem líquida */}
              <div className={`p-6 rounded-xl text-center ${getMarginBg(result.status)}`}>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Margem líquida
                </span>
                <div className={`${netMarginTextClass} font-extrabold mt-2 break-words ${getMarginColor(result.status)}`}>
                  {renderBreakable(netMarginDisplay)}
                </div>
                <span className="text-xs text-muted-foreground mt-1 block">
                  sobre {formatBRL(serviceValueNumber)}
                </span>
              </div>

              {/* Desconto máximo */}
              <div className="p-6 rounded-xl bg-secondary/40 text-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Desconto máximo
                </span>
                <div className={`${maxDiscountTextClass} font-extrabold text-primary mt-2 break-words`}>
                  {isFinite(result.maxDiscount) ? renderBreakable(maxDiscountDisplay) : 'indefinido'}
                </div>
                <span className="text-xs text-muted-foreground mt-1 block">
                  mantendo {desiredMargin}% de margem
                </span>
              </div>
            </div>

            {/* Secondary metrics - 4 cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-xl bg-secondary/20">
                <span className="text-sm text-muted-foreground block">Lucro líquido</span>
                <span className={`${netProfitTextClass} font-bold ${getMarginColor(result.status)} break-words`}>
                  {renderBreakable(netProfitDisplay)}
                </span>
              </div>
              <div className="text-center p-4 rounded-xl bg-secondary/20">
                <span className="text-sm text-muted-foreground block">Impostos</span>
                <span className={`${taxAmountTextClass} font-bold break-words`}>
                  {renderBreakable(taxAmountDisplay)}
                </span>
                {currentTaxRateNum > 0 && (
                  <span className="text-xs text-muted-foreground block">({currentTaxRateNum}%)</span>
                )}
              </div>
              <div className="text-center p-4 rounded-xl bg-secondary/20">
                <span className="text-sm text-muted-foreground block">Custo total</span>
                <span className={`${totalCostTextClass} font-bold break-words`}>
                  {renderBreakable(totalCostDisplay)}
                </span>
                {result.fixedPerJob > 0 && (
                  <span className="text-xs text-muted-foreground block">var. {formatBRL(result.variableCost)} + fixo {formatBRL(result.fixedPerJob)}</span>
                )}
              </div>
              <div className="text-center p-4 rounded-xl bg-secondary/20">
                <span className="text-sm text-muted-foreground block">Valor do serviço</span>
                <span className={`${serviceValueTextClass} font-bold break-words`}>
                  {renderBreakable(serviceValueDisplay)}
                </span>
              </div>
            </div>

            {/* Calculation details */}
            <Accordion type="single" collapsible className="p-4 border rounded-xl bg-secondary/20">
              <AccordionItem value="calc-details" className="border-b-0">
                <AccordionTrigger className="font-semibold">Detalhes do cálculo</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">1) Custo total (variável + fixo)</p>
                      <p className="mb-1">Objetivo: somar todos os custos (sem lucro).</p>
                      <div className="overflow-x-auto">
                        <BlockMath>{String.raw`\text{Custo total} = \text{Custos variáveis} + \text{Custo fixo por serviço}`}</BlockMath>
                      </div>
                      <div className="font-mono text-xs space-y-0.5">
                        {costItems.map((item) => (
                          <div key={item.id}>
                            {item.label}: {formatBRL(costItemValue(item, parseCurrency))}
                          </div>
                        ))}
                        {result.fixedPerJob > 0 && (
                          <div>Custo fixo/serviço: {formatBRL(result.fixedPerJob)} ({formatBRL(fixedMonthlyNumber)} / {jobsNumber} serviços)</div>
                        )}
                      </div>
                      <p className="font-mono mt-1">
                        Total = <span className="font-bold">{formatBRL(result.totalCost)}</span>
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-muted-foreground">2) Preço mínimo com margem desejada{currentTaxRateNum > 0 ? ' e impostos' : ''}</p>
                      <p className="mb-1">Objetivo: descobrir o menor preço para atingir a margem desejada.</p>
                      <div className="overflow-x-auto">
                        <BlockMath>{currentTaxRateNum > 0
                          ? String.raw`\text{Preço mínimo} = \dfrac{\text{Custo total}}{1 - \text{Margem} - \text{Impostos}}`
                          : String.raw`\text{Preço mínimo} = \dfrac{\text{Custo total}}{1 - \text{Margem}}`
                        }</BlockMath>
                      </div>
                      <p className="font-mono">
                        {formatBRL(result.totalCost)} / (1 - {Number(desiredMargin) || 0}%{currentTaxRateNum > 0 ? ` - ${currentTaxRateNum}%` : ''}) = <span className="font-bold">{isFinite(result.minimumPrice) ? formatBRL(result.minimumPrice) : 'indefinido'}</span>
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-muted-foreground">3) Margem bruta</p>
                      <p className="mb-1">Lucro antes dos impostos, em relação ao preço.</p>
                      <div className="overflow-x-auto">
                        <BlockMath>{String.raw`\%\,\text{Margem bruta} = \dfrac{\text{Valor} - \text{Custo total}}{\text{Valor}} \times 100`}</BlockMath>
                      </div>
                      <p className="font-mono">
                        ({formatBRL(serviceValueNumber)} - {formatBRL(result.totalCost)}) / {formatBRL(serviceValueNumber)} x 100 = <span className="font-bold">{result.grossMargin.toFixed(1)}%</span>
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-muted-foreground">4) Impostos</p>
                      <p className="mb-1">Valor dos impostos sobre o preço do serviço.</p>
                      <div className="overflow-x-auto">
                        <BlockMath>{String.raw`\text{Impostos} = \text{Valor} \times \text{Alíquota}`}</BlockMath>
                      </div>
                      <p className="font-mono">
                        {formatBRL(serviceValueNumber)} x {currentTaxRateNum}% = <span className="font-bold">{formatBRL(result.taxAmount)}</span>
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-muted-foreground">5) Margem líquida</p>
                      <p className="mb-1">O que sobra de fato após custos e impostos.</p>
                      <div className="overflow-x-auto">
                        <BlockMath>{String.raw`\%\,\text{Margem líq.} = \dfrac{\text{Valor} - \text{Custo total} - \text{Impostos}}{\text{Valor}} \times 100`}</BlockMath>
                      </div>
                      <p className="font-mono">
                        ({formatBRL(serviceValueNumber)} - {formatBRL(result.totalCost)} - {formatBRL(result.taxAmount)}) / {formatBRL(serviceValueNumber)} x 100 = <span className="font-bold">{result.netMargin.toFixed(1)}%</span>
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-muted-foreground">6) Desconto máximo</p>
                      <p className="mb-1">Objetivo: saber quanto desconto ainda cabe mantendo a margem desejada.</p>
                      <div className="overflow-x-auto">
                        <BlockMath>{String.raw`\%\,\text{Desconto máx.} = \dfrac{\text{Valor do serviço} - \text{Preço mínimo}}{\text{Valor do serviço}} \times 100`}</BlockMath>
                      </div>
                      <p className="font-mono">
                        ({formatBRL(serviceValueNumber)} - {isFinite(result.minimumPrice) ? formatBRL(result.minimumPrice) : 'indefinido'}) / {formatBRL(serviceValueNumber)} x 100 = <span className="font-bold">{isFinite(result.maxDiscount) ? result.maxDiscount.toFixed(1) : 'indefinido'}%</span>
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Save section */}
            <div className="max-w-md mx-auto w-full">
              <Label htmlFor="simulationName" className="text-sm">Nome da simulação <span className="text-destructive">*</span></Label>
              <Input
                id="simulationName"
                placeholder="Ex.: Orçamento Cliente X"
                value={simulationName}
                onChange={(e) => {
                  setSimulationName(e.target.value)
                  if (nameError && e.target.value.trim()) setNameError(null)
                  if (hasSavedOnce && !hasUnsavedChanges) {
                    setHasUnsavedChanges(true)
                    toast.warning('Alterações não salvas', { description: 'A simulação foi alterada e ainda não está salva.' })
                  }
                }}
                className={`mt-1 ${nameError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                aria-invalid={!!nameError}
                required
              />
              {nameError && (
                <p className="text-destructive text-xs mt-1">{nameError}</p>
              )}
            </div>

            <div className="flex flex-col items-center justify-center gap-2 mt-3">
              {hasUnsavedChanges && (
                <div className="text-xs text-warning">
                  A simulação foi alterada e ainda não está salva.
                </div>
              )}
              <div className="flex flex-col sm:flex-row justify-center gap-3 w-full max-w-md">
                <Button
                  variant="default"
                  size="lg"
                  className="w-full sm:w-auto justify-center px-8 flex items-center gap-2"
                  onClick={handleSave}
                  disabled={isSaving || !simulationName.trim()}
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Salvando...' : 'Salvar no Histórico'}
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto justify-center" onClick={resetForm}>Nova simulação</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!result && (
        <Card className="border-0 rounded-2xl shadow-soft p-6 sm:p-8 text-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Calculator className="h-8 w-8" />
            <p className="text-sm">Preencha os campos acima para ver o resultado do cálculo.</p>
            <p className="text-xs">Informe ao menos o Valor do Serviço para começarmos.</p>
          </div>
        </Card>
      )}
    </div>
  )
}
