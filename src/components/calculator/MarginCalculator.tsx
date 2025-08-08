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
              <TooltipContent side="right" className="max-w-xs text-left">
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
              <TooltipContent side="right" className="max-w-xs text-left">
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

  return (
    <div className="space-y-6 mx-auto scroll-smooth">
      <Card className="bg-white rounded-xl shadow-lg p-6 md:p-8">
        <CardHeader className="pb-12 text-center">
          <CardTitle className="text-primary text-2xl">Calculadora de Margem</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Preencha os campos abaixo. O resultado aparece automaticamente.</p>
        </CardHeader>
        <CardContent className="space-y-6">
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
                'Preço que você pretende cobrar do cliente por este serviço.',
                hasEdited && serviceValueNumber > 0 && serviceValueNumber < totalCostNumber
                  ? <span className="text-destructive text-xs">Valor do serviço está abaixo do custo total.</span>
                  : undefined
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderMoneyInput(
                  'travelCosts',
                  'Deslocamento',
                  inputs.travelCosts,
                  (v) => handleInputChange('travelCosts', v),
                  <Car className="h-4 w-4 text-muted-foreground" />,
                  '0,00',
                  undefined,
                  'Custos com transporte, combustível, pedágio ou estadia relacionados ao serviço.'
                )}
                {renderMoneyInput(
                  'materials',
                  'Materiais',
                  inputs.materials,
                  (v) => handleInputChange('materials', v),
                  <Package className="h-4 w-4 text-muted-foreground" />,
                  '0,00',
                  undefined,
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
                  undefined,
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
                    <TooltipContent side="right" className="max-w-xs text-left">
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
                <div className="flex justify-between"><span className="text-muted-foreground">Deslocamento</span><span className="font-medium">{formatBRL(parseCurrency(inputs.travelCosts))}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Materiais</span><span className="font-medium">{formatBRL(parseCurrency(inputs.materials))}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Horas x R$/h</span><span>{(Number(inputs.hoursWorked) || 0)} x {formatBRL(parseCurrency(inputs.hourlyRate))}</span></div>
                <Separator />
                <div className="flex justify-between font-medium"><span className="text-muted-foreground">Custo total</span><span className="font-semibold">{formatBRL(totalCostNumber)}</span></div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={resetForm}>Limpar</Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card className="bg-white rounded-xl shadow-lg p-6 animate-fade-in">
          <CardHeader className="text-center pb-8">
            <CardTitle className="flex items-center justify-center gap-3">
              <Badge variant={getStatusColor(result.status)} className="px-4 py-2 text-base md:text-lg">
                <span className="inline-flex items-center gap-1">
                  {getStatusIcon(result.status)}
                  {result.message}
                </span>
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
                  <span className="text-3xl md:text-4xl font-extrabold text-primary">{isFinite(result.minimumPrice) ? formatBRL(result.minimumPrice) : 'indefinido'}</span>
                </div>
                <div className="h-12 md:h-14 flex items-end justify-center">
                  <span className={`text-3xl md:text-4xl font-extrabold ${result.status === 'safe' ? 'text-success' : result.status === 'warning' ? 'text-warning' : 'text-destructive'
                    }`}>{result.actualMargin.toFixed(2)}%</span>
                </div>
                <div className="h-12 md:h-14 flex items-end justify-center">
                  <span className="text-3xl md:text-4xl font-extrabold text-primary">{isFinite(result.maxDiscount) ? Math.max(0, result.maxDiscount).toFixed(2) : 'indefinido'}%</span>
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
                  <span className={`text-base md:text-lg font-bold ${result.status === 'safe' ? 'text-success' : result.status === 'warning' ? 'text-warning' : 'text-destructive'
                    }`}>
                    {formatBRL((Math.max(result.actualMargin, 0) / 100) * serviceValueNumber)}
                  </span>
                </div>
                <div className="h-8 md:h-10 flex items-end justify-center">
                  <span className="text-base md:text-lg font-bold">{formatBRL(result.totalCost)}</span>
                </div>
                <div className="h-8 md:h-10 flex items-end justify-center">
                  <span className="text-base md:text-lg font-bold">{formatBRL(serviceValueNumber)}</span>
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
                      <BlockMath>{String.raw`\text{Custo total} = \text{Deslocamento} + (\text{Horas} \times \text{R\$/h}) + \text{Materiais}`}</BlockMath>
                      <p className="font-mono">
                        {formatBRL(parseCurrency(inputs.travelCosts))} + ({Number(inputs.hoursWorked) || 0} × {formatBRL(parseCurrency(inputs.hourlyRate))}) + {formatBRL(parseCurrency(inputs.materials))} = <span className="font-bold">{formatBRL(result.totalCost)}</span>
                      </p>
                      <p>O que mostra: quanto você gasta para executar o serviço.</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-muted-foreground">2) Preço mínimo com margem desejada</p>
                      <p className="mb-1">Objetivo: descobrir o menor preço para atingir a margem desejada.</p>
                      <BlockMath>{String.raw`\text{Preço mínimo} = \dfrac{\text{Custo total}}{1 - \text{Margem}}`}</BlockMath>
                      <p className="font-mono">
                        {formatBRL(result.totalCost)} ÷ (1 − {Number(inputs.desiredMargin) || 0}%) = <span className="font-bold">{isFinite(result.minimumPrice) ? formatBRL(result.minimumPrice) : 'indefinido'}</span>
                      </p>
                      <p>O que mostra: o preço abaixo do qual sua <strong>margem ficará menor</strong> do que a desejada.</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-muted-foreground">3) Sua margem com o valor informado</p>
                      <p className="mb-1">Objetivo: medir a sua margem real com o preço que você digitou.</p>
                      <BlockMath>{String.raw`\%\,\text{Margem} = \dfrac{\text{Valor do serviço} - \text{Custo total}}{\text{Valor do serviço}} \times 100`}</BlockMath>
                      <p className="font-mono">
                        ({formatBRL(serviceValueNumber)} − {formatBRL(result.totalCost)}) ÷ {formatBRL(serviceValueNumber)} × 100 = <span className="font-bold">{result.actualMargin.toFixed(1)}%</span>
                      </p>
                      <p>O que mostra: qual parte do preço é lucro. Se negativo, indica prejuízo.</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-muted-foreground">4) Desconto máximo</p>
                      <p className="mb-1">Objetivo: saber quanto desconto ainda cabe mantendo a margem desejada.</p>
                      <BlockMath>{String.raw`\%\,\text{Desconto máx.} = \dfrac{\text{Valor do serviço} - \text{Preço mínimo}}{\text{Valor do serviço}} \times 100`}</BlockMath>
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
              <div className="flex justify-center gap-3">
              <Button
                variant="default"
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white px-8 flex items-center gap-2"
                onClick={handleSave}
                disabled={isSaving || !simulationName.trim()}
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Salvando...' : 'Salvar no Histórico'}
              </Button>
              <Button variant="outline" size="lg" onClick={resetForm}>Nova simulação</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!result && (
        <Card className="bg-white rounded-xl shadow-md p-8 text-center">
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