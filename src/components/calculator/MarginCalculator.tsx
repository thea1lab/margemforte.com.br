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
  Clock,
  Package,
  Car,
  Percent,
  HelpCircle,
  Save
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { InlineMath, BlockMath } from 'react-katex'
import { toast } from '@/components/ui/sonner'
import { useLocation, useNavigate } from 'react-router-dom'

interface CalculationResult {
  totalCost: number
  minimumPrice: number
  maxDiscount: number
  actualMargin: number
  status: 'safe' | 'warning' | 'danger'
  message: string
}

export const MarginCalculator = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [inputs, setInputs] = useState({
    serviceValue: '',
    travelCosts: '',
    hoursWorked: '',
    hourlyRate: '',
    materials: '',
    desiredMargin: '20'
  })

  const [result, setResult] = useState<CalculationResult | null>(null)
  const [hasEdited, setHasEdited] = useState(false)
  const [simulationName, setSimulationName] = useState('')

  const [isSaving, setIsSaving] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)
  const [hasSavedOnce, setHasSavedOnce] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [simulationId, setSimulationId] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const id = params.get('id')
    if (id) setSimulationId(id)
  }, [location.search])

  useEffect(() => {
    if (!simulationId) return
    let isCancelled = false
    const loadSimulation = async () => {
      try {
        const { getCalculatorHistoryById } = await import('@/integrations/supabase/calculatorHistory')
        const data = await getCalculatorHistoryById(simulationId)
        if (isCancelled || !data) return
        setSimulationName(data.simulation_name ?? '')
        setInputs({
          serviceValue: formatNumberToInput(data.service_value ?? 0),
          travelCosts: formatNumberToInput(data.travel_costs ?? 0),
          hoursWorked: String(data.hours_worked ?? ''),
          hourlyRate: formatNumberToInput(data.hourly_rate ?? 0),
          materials: formatNumberToInput(data.materials ?? 0),
          desiredMargin: String(data.desired_margin ?? '20')
        })
        setHasEdited(false)
        setHasSavedOnce(true)
        setHasUnsavedChanges(false)
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err)
        toast.error('Não foi possível carregar a simulação', {
          description: 'Verifique o link ou tente novamente.'
        })
      }
    }
    loadSimulation()
    return () => { isCancelled = true }
  }, [simulationId])

  const formatCurrency = (value: string): string => {
    const numericValue = value.replace(/\D/g, '')
    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number(numericValue) / 100)
    return formattedValue
  }

  const parseCurrency = (value: string): number => {
    return Number(value.replace(/\D/g, '')) / 100
  }

  const formatNumberToInput = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number(value) || 0)
  }

  const handleInputChange = (field: string, value: string) => {
    if (['serviceValue', 'travelCosts', 'hourlyRate', 'materials'].includes(field)) {
      const formatted = formatCurrency(value)
      setInputs(prev => ({ ...prev, [field]: formatted }))
    } else {
      setInputs(prev => ({ ...prev, [field]: value }))
    }
    if (!hasEdited) setHasEdited(true)
    if (hasSavedOnce && !hasUnsavedChanges) setHasUnsavedChanges(true)
  }

  const calculateMargin = (): CalculationResult => {
    const serviceValue = parseCurrency(inputs.serviceValue)
    const travelCosts = parseCurrency(inputs.travelCosts)
    const hoursWorked = Number(inputs.hoursWorked) || 0
    const hourlyRate = parseCurrency(inputs.hourlyRate)
    const materials = parseCurrency(inputs.materials)
    const desiredMargin = Math.min(100, Math.max(0, Number(inputs.desiredMargin) || 0))

    const totalCost = travelCosts + hoursWorked * hourlyRate + materials
    const denominator = 1 - desiredMargin / 100
    const minimumPrice = denominator <= 0 ? Number.POSITIVE_INFINITY : totalCost / denominator
    const safeServiceValue = serviceValue > 0 ? serviceValue : 1 // prevent division by zero
    const maxDiscount = ((serviceValue - minimumPrice) / safeServiceValue) * 100
    const actualMargin = ((serviceValue - totalCost) / safeServiceValue) * 100

    let status: CalculationResult['status'] = 'safe'
    let message = ''

    if (actualMargin >= 20) {
      status = 'safe'
      message = 'Excelente margem de lucro!'
    } else if (actualMargin >= 10) {
      status = 'warning'
      message = 'Atenção: margem apertada'
    } else {
      status = 'danger'
      message = 'Alerta: risco de prejuízo'
    }

    return {
      totalCost,
      minimumPrice,
      maxDiscount,
      actualMargin,
      status,
      message
    }
  }

  useEffect(() => {
    const svc = parseCurrency(inputs.serviceValue)
    if (svc > 0) {
      const calculatedResult = calculateMargin()
      setResult(calculatedResult)
    } else {
      setResult(null)
    }
  }, [inputs])

  const getStatusColor = (status: CalculationResult['status']) => {
    switch (status) {
      case 'safe': return 'success'
      case 'warning': return 'warning'
      case 'danger': return 'destructive'
      default: return 'secondary'
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

  const formatBRL = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Picks a smaller text size when the number string is very long
  const getNumberSizeClasses = (text: string): string => {
    const length = text.replace(/[\s\u00A0]/g, '').length
    if (length <= 12) return 'text-3xl md:text-3xl'
    if (length <= 18) return 'text-2xl md:text-2xl'
    if (length <= 24) return 'text-xl md:text-xl'
    return 'text-lg md:text-lg'
  }

  // Same idea but for smaller base sizes used in the second row of values
  const getSmallNumberSizeClasses = (text: string): string => {
    const length = text.replace(/[\s\u00A0]/g, '').length
    if (length <= 12) return 'text-base md:text-lg'
    if (length <= 18) return 'text-sm md:text-base'
    if (length <= 24) return 'text-xs md:text-sm'
    return 'text-[10px] md:text-xs'
  }

  // Render text with <wbr> soft-break hints after thousand separators and before '%'
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

  const resetForm = () => {
    setInputs({
      serviceValue: '',
      travelCosts: '',
      hoursWorked: '',
      hourlyRate: '',
      materials: '',
      desiredMargin: '20'
    })
    setHasEdited(false)
    setSimulationName('')
    setNameError(null)
    setHasUnsavedChanges(false)
    setHasSavedOnce(false)
    setSimulationId(null)
    navigate('/', { replace: true })
  }

  const handleSave = async () => {
    if (!result) return
    if (!simulationName.trim()) {
      setNameError('Campo obrigatório')
      const el = document.getElementById('simulationName') as HTMLInputElement | null
      el?.focus()
      return
    }
    try {
      setIsSaving(true)
      const { saveCalculatorHistory, updateCalculatorHistory } = await import('@/integrations/supabase/calculatorHistory')
      const payload = {
        simulation_name: simulationName || 'Simulação sem nome',
        service_value: parseCurrency(inputs.serviceValue),
        travel_costs: parseCurrency(inputs.travelCosts),
        hours_worked: Number(inputs.hoursWorked) || 0,
        hourly_rate: parseCurrency(inputs.hourlyRate),
        materials: parseCurrency(inputs.materials),
        desired_margin: Math.min(100, Math.max(0, Number(inputs.desiredMargin) || 0))
      }

      let saved
      if (simulationId) {
        saved = await updateCalculatorHistory(simulationId, payload)
      } else {
        saved = await saveCalculatorHistory(payload)
        if (saved?.id) {
          const params = new URLSearchParams(location.search)
          params.set('id', saved.id)
          navigate({ pathname: location.pathname, search: params.toString() }, { replace: true })
          setSimulationId(saved.id)
        }
      }
      toast.success('Simulação salva com sucesso', {
        description: simulationName || 'A simulação foi salva no histórico.'
      })
      setHasSavedOnce(true)
      setHasUnsavedChanges(false)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      toast.error('Não foi possível salvar', { description: 'Tente novamente em instantes.' })
    } finally {
      setIsSaving(false)
    }
  }

  const MarginPreset = ({ value }: { value: number }) => (
    <button
      type="button"
      onClick={() => handleInputChange('desiredMargin', String(value))}
      className={`px-3 py-1 rounded-full border text-xs transition ${Number(inputs.desiredMargin) === value
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

  const renderMoneyInput = (
    id: string,
    label: string,
    value: string,
    onChange: (val: string) => void,
    icon?: JSX.Element,
    placeholder: string = '0,00',
    extraClassName?: string,
    helpText?: string,
    belowNode?: JSX.Element
  ) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={id} className="text-sm font-medium flex items-center gap-2">
          {icon}
          {label}
        </Label>
        {helpText && (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="text-muted-foreground hover:text-foreground" aria-label={`Dica: ${label}`} tabIndex={-1} aria-hidden="true">
                  <HelpCircle className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-left">
                {helpText}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
        <Input
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`pl-10 ${extraClassName ?? ''}`}
          inputMode="numeric"
          aria-describedby={helpText ? `${id}-desc` : undefined}
        />
      </div>
      {helpText && (
        <span id={`${id}-desc`} className="sr-only">{helpText}</span>
      )}
      {belowNode && <div className="mt-[-3px]">{belowNode}</div>}
    </div>
  )

  const renderNumberInput = (
    id: string,
    label: string,
    value: string,
    onChange: (val: string) => void,
    icon?: JSX.Element,
    step: string = '1',
    min: string = '0',
    placeholder: string = '0',
    helpText?: string
  ) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={id} className="text-sm font-medium flex items-center gap-2">
          {icon}
          {label}
        </Label>
        {helpText && (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="text-muted-foreground hover:text-foreground" aria-label={`Dica: ${label}`} tabIndex={-1} aria-hidden="true">
                  <HelpCircle className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-left">
                {helpText}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <Input
        id={id}
        type="number"
        step={step}
        min={min}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={helpText ? `${id}-desc` : undefined}
      />
      {helpText && (
        <span id={`${id}-desc`} className="sr-only">{helpText}</span>
      )}
    </div>
  )

  const serviceValueNumber = parseCurrency(inputs.serviceValue)
  const totalCostNumber = (parseCurrency(inputs.travelCosts) + parseCurrency(inputs.materials) + (Number(inputs.hoursWorked) || 0) * parseCurrency(inputs.hourlyRate))
  const minimumPriceDisplay = result && isFinite(result.minimumPrice) ? formatBRL(result.minimumPrice) : ''
  const minPriceTextClass = minimumPriceDisplay ? getNumberSizeClasses(minimumPriceDisplay) : 'text-3xl md:text-4xl'
  const actualMarginDisplay = result ? `${result.actualMargin.toFixed(2)}%` : ''
  const actualMarginTextClass = actualMarginDisplay ? getNumberSizeClasses(actualMarginDisplay) : 'text-3xl md:text-4xl'
  const maxDiscountDisplay = result && isFinite(result.maxDiscount) ? `${Math.max(0, result.maxDiscount).toFixed(2)}%` : ''
  const maxDiscountTextClass = maxDiscountDisplay ? getNumberSizeClasses(maxDiscountDisplay) : 'text-3xl md:text-4xl'

  const revenueDisplay = result ? formatBRL((Math.max(result.actualMargin, 0) / 100) * serviceValueNumber) : ''
  const revenueTextClass = revenueDisplay ? getSmallNumberSizeClasses(revenueDisplay) : 'text-base md:text-lg'
  const totalCostDisplay = result ? formatBRL(result.totalCost) : ''
  const totalCostTextClass = totalCostDisplay ? getSmallNumberSizeClasses(totalCostDisplay) : 'text-base md:text-lg'
  const serviceValueDisplay = result ? formatBRL(serviceValueNumber) : ''
  const serviceValueTextClass = serviceValueDisplay ? getSmallNumberSizeClasses(serviceValueDisplay) : 'text-base md:text-lg'

  const minPriceBreakable = minimumPriceDisplay ? renderBreakable(minimumPriceDisplay) : null
  const actualMarginBreakable = actualMarginDisplay ? renderBreakable(actualMarginDisplay) : null
  const maxDiscountBreakable = maxDiscountDisplay ? renderBreakable(maxDiscountDisplay) : null
  const revenueBreakable = revenueDisplay ? renderBreakable(revenueDisplay) : null
  const totalCostBreakable = totalCostDisplay ? renderBreakable(totalCostDisplay) : null
  const serviceValueBreakable = serviceValueDisplay ? renderBreakable(serviceValueDisplay) : null

  // Breakable values for the right info panel (Deslocamento/Materiais/Horas x R$/h/Custo total)
  const travelCostsDisplay = formatBRL(parseCurrency(inputs.travelCosts))
  const travelCostsBreakable = renderBreakable(travelCostsDisplay)
  const materialsDisplay = formatBRL(parseCurrency(inputs.materials))
  const materialsBreakable = renderBreakable(materialsDisplay)
  const hoursTimesRateDisplay = `${Number(inputs.hoursWorked) || 0} x ${formatBRL(parseCurrency(inputs.hourlyRate))}`
  const hoursTimesRateBreakable = renderBreakable(hoursTimesRateDisplay)
  const totalCostPanelDisplay = formatBRL(totalCostNumber)
  const totalCostPanelBreakable = renderBreakable(totalCostPanelDisplay)

  return (
    <div className="space-y-6 mx-auto scroll-smooth">
      <Card className="border text-card-foreground bg-white rounded-xl shadow-lg p-3 sm:p-6 md:p-8">
        <CardHeader className="p-0 sm:p-6 pb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-[1.45] md:leading-[1.35] overflow-visible">
            <span className="inline-flex flex-wrap items-baseline justify-center gap-3 overflow-visible">
              <Calculator className="h-7 w-7 text-primary" />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent inline-block leading-[inherit] pb-[2px] overflow-visible whitespace-normal break-words">
                Calculadora de Margem
              </span>
            </span>
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            Preencha os campos e veja seus números em tempo real.
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 px-3">
            <Badge variant="secondary" className="text-[11px]">Tempo real</Badge>
            <Badge variant="secondary" className="text-[11px]">Fácil de usar</Badge>
            <Badge variant="secondary" className="text-[11px]">Sem planilhas</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {renderMoneyInput(
                'serviceValue',
                'Valor do Serviço',
                inputs.serviceValue,
                (v) => handleInputChange('serviceValue', v),
                <DollarSign className="h-4 w-4 text-muted-foreground" />,
                '0,00',
                'h-12 text-lg',
                'Preço que você pretende cobrar do cliente por este serviço.'
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderMoneyInput(
                  'travelCosts',
                  'Deslocamento',
                  inputs.travelCosts,
                  (v) => handleInputChange('travelCosts', v),
                  <Car className="h-4 w-4 text-muted-foreground" />,
                  '0,00',
                  'h-12 text-lg',
                  'Custos com transporte, combustível, pedágio ou estadia relacionados ao serviço.'
                )}
                {renderMoneyInput(
                  'materials',
                  'Materiais',
                  inputs.materials,
                  (v) => handleInputChange('materials', v),
                  <Package className="h-4 w-4 text-muted-foreground" />,
                  '0,00',
                  'h-12 text-lg',
                  'Gastos com peças, insumos e materiais necessários para executar o serviço.'
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderNumberInput(
                  'hoursWorked',
                  'Horas',
                  inputs.hoursWorked,
                  (v) => handleInputChange('hoursWorked', v),
                  <Clock className="h-4 w-4 text-muted-foreground" />,
                  '1',
                  '0',
                  '0',
                  'Quantidade total de horas estimadas para realizar o serviço.'
                )}
                {renderMoneyInput(
                  'hourlyRate',
                  'R$/h',
                  inputs.hourlyRate,
                  (v) => handleInputChange('hourlyRate', v),
                  <DollarSign className="h-4 w-4 text-muted-foreground" />,
                  '0,00',
                  'h-12 text-lg',
                  'Quanto você cobra por hora de trabalho.'
                )}
              </div>
            </div>

            <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2">
                <Label htmlFor="desiredMargin" className="text-sm font-medium flex items-center gap-2">
                  Margem desejada
                </Label>
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="text-muted-foreground hover:text-foreground" aria-label="Dica: Margem desejada" tabIndex={-1} aria-hidden="true">
                        <HelpCircle className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs text-left">
                      Percentual de lucro-alvo. Usada para calcular o preço mínimo e o desconto máximo. Não altera a sua margem atual.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center gap-3">
                <Slider
                  value={[Number(inputs.desiredMargin) || 0]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={(v) => handleInputChange('desiredMargin', String(v[0]))}
                  aria-label="Margem desejada"
                  aria-describedby="desiredMargin-desc"
                  className="flex-1"
                />
                <span className="text-lg font-bold text-primary min-w-[60px] text-right">
                  {inputs.desiredMargin}%
                </span>
              </div>
              <span id="desiredMargin-desc" className="sr-only">Margem de lucro-alvo (sobre o preço). Define o preço mínimo e o desconto máximo, não altera a sua margem atual. Use as setas do teclado para ajustar.</span>
              <div className="flex flex-wrap gap-2">
                {[10, 20, 30, 40, 50, 60].map((p) => (
                  <MarginPreset key={p} value={p} />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Recomendado: 30% a 50%.</p>
              <Separator />
              <div className="text-sm space-y-1">
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Deslocamento</span>
                  <span className="font-medium break-words whitespace-normal text-right">{travelCostsBreakable}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Materiais</span>
                  <span className="font-medium break-words whitespace-normal text-right">{materialsBreakable}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Horas x R$/h</span>
                  <span className="break-words whitespace-normal text-right">{hoursTimesRateBreakable}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium gap-3">
                  <span className="text-muted-foreground">Custo total</span>
                  <span className="font-semibold break-words whitespace-normal text-right">{totalCostPanelBreakable}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={resetForm}>Limpar</Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card className="border text-card-foreground bg-white rounded-xl shadow-lg p-3 sm:p-6 animate-fade-in">
          <CardHeader className="p-0 sm:p-6 text-center pb-8">
            <CardTitle className="flex items-center justify-center gap-3">
              <Badge variant={getStatusColor(result.status)} className="px-4 py-2 text-base md:text-lg">
                <span className="inline-flex items-center gap-1">
                  {getStatusIcon(result.status)}
                  {result.message}
                </span>
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 space-y-6">
            <div className="p-4 border rounded-lg bg-muted/20">
              {/* Row 1: labels */}
              <div className="grid grid-cols-1 md:grid-cols-3 text-center md:divide-x md:divide-border">
                <div className="min-h-[24px] flex items-center justify-center">
                  <span className="text-xs text-muted-foreground leading-snug">Preço mínimo com margem desejada</span>
                </div>
                <div className="min-h-[24px] flex items-center justify-center">
                  <span className="text-xs text-muted-foreground leading-snug">% Margem</span>
                </div>
                <div className="min-h-[24px] flex items-center justify-center">
                  <span className="text-xs text-muted-foreground leading-snug">Desconto máximo mantendo a margem desejada</span>
                </div>
              </div>
              {/* Row 2: values */}
              <div className="grid grid-cols-1 md:grid-cols-3 text-center md:divide-x md:divide-border mt-0">
                <div className="h-12 md:h-14 flex items-end justify-center">
                  <span className={`${minPriceTextClass} font-extrabold text-primary break-words text-balance whitespace-normal`}>{isFinite(result.minimumPrice) ? minPriceBreakable : 'indefinido'}</span>
                </div>
                <div className="h-12 md:h-14 flex items-end justify-center">
                  <span className={`${actualMarginTextClass} font-extrabold ${result.status === 'safe' ? 'text-success' : result.status === 'warning' ? 'text-warning' : 'text-destructive'} break-words text-balance whitespace-normal`}>
                    {actualMarginBreakable}
                  </span>
                </div>
                <div className="h-12 md:h-14 flex items-end justify-center">
                  <span className={`${maxDiscountTextClass} font-extrabold text-primary break-words text-balance whitespace-normal`}>
                    {isFinite(result.maxDiscount) ? maxDiscountBreakable : 'indefinido'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-muted/20">
              {/* Row 1: labels */}
              <div className="grid grid-cols-1 md:grid-cols-3 text-center md:divide-x md:divide-border">
                <div className="min-h-[24px] flex items-center justify-center">
                  <span className="text-sm text-muted-foreground leading-snug">Receita (margem)</span>
                </div>
                <div className="min-h-[24px] flex items-center justify-center">
                  <span className="text-sm text-muted-foreground leading-snug">Custo total</span>
                </div>
                <div className="min-h-[24px] flex items-center justify-center">
                  <span className="text-sm text-muted-foreground leading-snug">Valor do serviço</span>
                </div>
              </div>
              {/* Row 2: values */}
              <div className="grid grid-cols-1 md:grid-cols-3 text-center md:divide-x md:divide-border mt-0">
                <div className="h-8 md:h-10 flex items-end justify-center">
                  <span className={`${revenueTextClass} font-bold ${result.status === 'safe' ? 'text-success' : result.status === 'warning' ? 'text-warning' : 'text-destructive'} break-words whitespace-normal`}>
                    {revenueBreakable}
                  </span>
                </div>
                <div className="h-8 md:h-10 flex items-end justify-center">
                  <span className={`${totalCostTextClass} font-bold break-words whitespace-normal`}>{totalCostBreakable}</span>
                </div>
                <div className="h-8 md:h-10 flex items-end justify-center">
                  <span className={`${serviceValueTextClass} font-bold break-words whitespace-normal`}>{serviceValueBreakable}</span>
                </div>
              </div>
            </div>


            <Accordion type="single" collapsible className="p-4 border rounded-lg bg-muted/30">
              <AccordionItem value="calc-details" className="border-b-0">
                <AccordionTrigger>Detalhes do cálculo</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">1) Custo total</p>
                      <p className="mb-1">Objetivo: somar todos os custos do serviço (sem lucro).</p>
                      <div className="overflow-x-auto">
                        <BlockMath>{String.raw`\text{Custo total} = \text{Deslocamento} + (\text{Horas} \times \text{R\$/h}) + \text{Materiais}`}</BlockMath>
                      </div>
                      <p className="font-mono">
                        {formatBRL(parseCurrency(inputs.travelCosts))} + ({Number(inputs.hoursWorked) || 0} × {formatBRL(parseCurrency(inputs.hourlyRate))}) + {formatBRL(parseCurrency(inputs.materials))} = <span className="font-bold">{formatBRL(result.totalCost)}</span>
                      </p>
                      <p>O que mostra: quanto você gasta para executar o serviço.</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-muted-foreground">2) Preço mínimo com margem desejada</p>
                      <p className="mb-1">Objetivo: descobrir o menor preço para atingir a margem desejada.</p>
                      <div className="overflow-x-auto">
                        <BlockMath>{String.raw`\text{Preço mínimo} = \dfrac{\text{Custo total}}{1 - \text{Margem}}`}</BlockMath>
                      </div>
                      <p className="font-mono">
                        {formatBRL(result.totalCost)} ÷ (1 − {Number(inputs.desiredMargin) || 0}%) = <span className="font-bold">{isFinite(result.minimumPrice) ? formatBRL(result.minimumPrice) : 'indefinido'}</span>
                      </p>
                      <p>O que mostra: o preço abaixo do qual sua <strong>margem ficará menor</strong> do que a desejada.</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-muted-foreground">3) Sua margem com o valor informado</p>
                      <p className="mb-1">Objetivo: medir a sua margem real com o preço que você digitou.</p>
                      <div className="overflow-x-auto">
                        <BlockMath>{String.raw`\%\,\text{Margem} = \dfrac{\text{Valor do serviço} - \text{Custo total}}{\text{Valor do serviço}} \times 100`}</BlockMath>
                      </div>
                      <p className="font-mono">
                        ({formatBRL(serviceValueNumber)} − {formatBRL(result.totalCost)}) ÷ {formatBRL(serviceValueNumber)} × 100 = <span className="font-bold">{result.actualMargin.toFixed(1)}%</span>
                      </p>
                      <p>O que mostra: qual parte do preço é lucro. Se negativo, indica prejuízo.</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-muted-foreground">4) Desconto máximo</p>
                      <p className="mb-1">Objetivo: saber quanto desconto ainda cabe mantendo a margem desejada.</p>
                      <div className="overflow-x-auto">
                        <BlockMath>{String.raw`\%\,\text{Desconto máx.} = \dfrac{\text{Valor do serviço} - \text{Preço mínimo}}{\text{Valor do serviço}} \times 100`}</BlockMath>
                      </div>
                      <p className="font-mono">
                        ({formatBRL(serviceValueNumber)} − {isFinite(result.minimumPrice) ? formatBRL(result.minimumPrice) : 'indefinido'}) ÷ {formatBRL(serviceValueNumber)} × 100 = <span className="font-bold">{isFinite(result.maxDiscount) ? result.maxDiscount.toFixed(1) : 'indefinido'}%</span>
                      </p>
                      <p>O que mostra: o limite de desconto para não ficar abaixo da margem desejada.</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

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
                aria-describedby={nameError ? 'simulationName-error' : undefined}
                required
              />
              {nameError && (
                <p id="simulationName-error" className="text-destructive text-xs mt-1">{nameError}</p>
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
                  className="w-full sm:w-auto justify-center bg-primary hover:bg-primary/90 text-white px-8 flex items-center gap-2"
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
        <Card className="border text-card-foreground bg-white rounded-xl shadow-md p-3 sm:p-8 text-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Calculator className="h-8 w-8" />
            <p className="text-sm">Preencha os campos acima para ver o resultado do cálculo.</p>
            <p className="text-xs">Informe ao menos o Valor do Serviço para começarmos.</p>
          </div>
        </Card>
      )}

      {/* FAQ moved to dedicated /faq page */}
    </div>
  )
}