/**
 * Pure calculation functions for margin computation.
 * Extracted from MarginCalculator for testability.
 */

export interface MarginInput {
  /** Price charged to client (BRL) */
  serviceValue: number
  /** Sum of variable cost items (BRL) */
  variableCost: number
  /** Total monthly fixed costs (BRL) */
  fixedCostMonthly: number
  /** Number of jobs/services per month */
  jobsPerMonth: number
  /** Desired margin percentage (0-100) */
  desiredMargin: number
  /** Tax rate percentage (0-100) */
  taxRate: number
}

export interface MarginResult {
  variableCost: number
  fixedPerJob: number
  totalCost: number
  minimumPrice: number
  maxDiscount: number
  grossMargin: number
  taxAmount: number
  netMargin: number
  status: 'safe' | 'warning' | 'danger'
  message: string
}

export function calculateMargin(input: MarginInput): MarginResult {
  const { serviceValue: svc, variableCost, fixedCostMonthly, jobsPerMonth, desiredMargin, taxRate } = input

  const jobs = Math.max(1, jobsPerMonth || 1)
  const fixedPerJob = fixedCostMonthly / jobs
  const totalCost = variableCost + fixedPerJob
  const clampedTaxRate = Math.min(100, Math.max(0, taxRate || 0))
  const taxAmount = svc * (clampedTaxRate / 100)
  const clampedMargin = Math.min(100, Math.max(0, desiredMargin || 0))

  const denominator = 1 - clampedMargin / 100 - clampedTaxRate / 100
  const minimumPrice = denominator <= 0 ? Number.POSITIVE_INFINITY : totalCost / denominator
  const safeSvc = svc > 0 ? svc : 1
  const rawMaxDiscount = ((svc - minimumPrice) / safeSvc) * 100
  const maxDiscount = Math.max(0, rawMaxDiscount)
  const grossMargin = ((svc - totalCost) / safeSvc) * 100
  const netMargin = ((svc - totalCost - taxAmount) / safeSvc) * 100

  let status: MarginResult['status'] = 'safe'
  let message = ''

  if (clampedMargin > 0) {
    // Status relative to desired margin
    if (netMargin >= clampedMargin) {
      status = 'safe'
      message = 'Margem acima do alvo!'
    } else if (netMargin >= 0) {
      status = 'warning'
      message = 'Margem abaixo do alvo'
    } else {
      status = 'danger'
      message = 'Alerta: prejuízo no cenário atual'
    }
  } else {
    // No desired margin set — use absolute thresholds
    if (netMargin >= 20) {
      status = 'safe'
      message = 'Excelente margem de lucro!'
    } else if (netMargin >= 10) {
      status = 'warning'
      message = 'Atenção: margem apertada'
    } else {
      status = 'danger'
      message = 'Alerta: risco de prejuízo'
    }
  }

  return { variableCost, fixedPerJob, totalCost, minimumPrice, maxDiscount, grossMargin, taxAmount, netMargin, status, message }
}
