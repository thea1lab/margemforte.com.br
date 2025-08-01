import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button-variants'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Calculator, TrendingUp, AlertTriangle, CheckCircle2, DollarSign } from 'lucide-react'

interface CalculationResult {
  totalCost: number
  minimumPrice: number
  maxDiscount: number
  actualMargin: number
  status: 'safe' | 'warning' | 'danger'
  message: string
}

export const MarginCalculator = () => {
  const [inputs, setInputs] = useState({
    serviceValue: '',
    travelCosts: '',
    hoursWorked: '',
    hourlyRate: '',
    materials: '',
    desiredMargin: '20'
  })

  const [result, setResult] = useState<CalculationResult | null>(null)

  const formatCurrency = (value: string): string => {
    const numericValue = value.replace(/\D/g, '')
    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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
  }

  const calculateMargin = (): CalculationResult => {
    const serviceValue = parseCurrency(inputs.serviceValue)
    const travelCosts = parseCurrency(inputs.travelCosts)
    const hoursWorked = Number(inputs.hoursWorked) || 0
    const hourlyRate = parseCurrency(inputs.hourlyRate)
    const materials = parseCurrency(inputs.materials)
    const desiredMargin = Number(inputs.desiredMargin) || 0

    const totalCost = travelCosts + (hoursWorked * hourlyRate) + materials
    const minimumPrice = totalCost / (1 - desiredMargin / 100)
    const maxDiscount = ((serviceValue - minimumPrice) / serviceValue) * 100
    const actualMargin = ((serviceValue - totalCost) / serviceValue) * 100

    let status: 'safe' | 'warning' | 'danger' = 'safe'
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
    if (inputs.serviceValue && inputs.travelCosts && inputs.hoursWorked && inputs.hourlyRate) {
      const calculatedResult = calculateMargin()
      setResult(calculatedResult)
    } else {
      setResult(null)
    }
  }, [inputs])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'success'
      case 'warning': return 'warning'
      case 'danger': return 'destructive'
      default: return 'secondary'
    }
  }

  const getStatusIcon = (status: string) => {
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

  return (
    <div className="space-y-6">
      <Card className="bg-white rounded-xl shadow-lg p-8">
        <CardHeader className="text-center pb-6">
          <CardTitle className="flex items-center justify-center gap-2 text-primary text-2xl">
            💰 CALCULADORA DE MARGEM
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="serviceValue" className="text-sm font-medium">Valor do Serviço</Label>
              <Input
                id="serviceValue"
                placeholder="R$ 0,00"
                value={inputs.serviceValue}
                onChange={(e) => handleInputChange('serviceValue', e.target.value)}
                className="h-12 text-lg"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="travelCosts" className="text-sm">Deslocamento</Label>
                <Input
                  id="travelCosts"
                  placeholder="R$ 0,00"
                  value={inputs.travelCosts}
                  onChange={(e) => handleInputChange('travelCosts', e.target.value)}
                  className="h-10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="materials" className="text-sm">Materiais</Label>
                <Input
                  id="materials"
                  placeholder="R$ 0,00"
                  value={inputs.materials}
                  onChange={(e) => handleInputChange('materials', e.target.value)}
                  className="h-10"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hoursWorked" className="text-sm">Horas</Label>
                <Input
                  id="hoursWorked"
                  type="number"
                  step="0.5"
                  placeholder="0"
                  value={inputs.hoursWorked}
                  onChange={(e) => handleInputChange('hoursWorked', e.target.value)}
                  className="h-10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hourlyRate" className="text-sm">R$/h</Label>
                <Input
                  id="hourlyRate"
                  placeholder="R$ 0,00"
                  value={inputs.hourlyRate}
                  onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                  className="h-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="desiredMargin" className="text-sm">Margem Desejada</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="desiredMargin"
                  type="range"
                  min="0"
                  max="60"
                  value={inputs.desiredMargin}
                  onChange={(e) => handleInputChange('desiredMargin', e.target.value)}
                  className="flex-1"
                />
                <span className="text-lg font-bold text-primary min-w-[60px]">
                  {inputs.desiredMargin}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card className="bg-white rounded-xl shadow-lg p-6 animate-fade-in">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-primary">
              📊 RESULTADO
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`p-6 rounded-lg text-center ${
              result.status === 'safe' ? 'bg-success/10 border-success' : 
              result.status === 'warning' ? 'bg-warning/10 border-warning' : 'bg-destructive/10 border-destructive'
            } border`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {getStatusIcon(result.status)}
                <span className="font-medium">{result.message}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Desconto Máximo</p>
                  <p className="text-lg font-bold text-primary">{result.maxDiscount.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Preço Mínimo</p>
                  <p className="text-lg font-bold text-primary">{formatBRL(result.minimumPrice)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Sua Margem</p>
                  <p className={`text-lg font-bold ${
                    result.status === 'safe' ? 'text-success' : 
                    result.status === 'warning' ? 'text-warning' : 'text-destructive'
                  }`}>
                    {formatBRL((result.actualMargin / 100) * parseCurrency(inputs.serviceValue))}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">% Margem</p>
                  <p className={`text-lg font-bold ${
                    result.status === 'safe' ? 'text-success' : 
                    result.status === 'warning' ? 'text-warning' : 'text-destructive'
                  }`}>
                    {result.actualMargin.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-6">
              <Button 
                variant="default" 
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white px-8"
              >
                💾 Salvar no Histórico
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}