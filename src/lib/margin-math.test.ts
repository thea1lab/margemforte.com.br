import { describe, it, expect } from 'vitest'
import { calculateMargin, type MarginInput } from './margin-math'

/** Helper: build a full input with sensible defaults, overriding as needed */
function input(overrides: Partial<MarginInput> = {}): MarginInput {
  return {
    serviceValue: 1000,
    variableCost: 400,
    fixedCostMonthly: 0,
    jobsPerMonth: 10,
    desiredMargin: 30,
    taxRate: 0,
    ...overrides,
  }
}

/** Round to N decimal places to avoid floating-point noise */
function round(n: number, decimals = 2): number {
  const factor = 10 ** decimals
  return Math.round(n * factor) / factor
}

// ─── Basic margin (no tax, no fixed costs) ───────────────────────

describe('basic margin calculation (no tax, no fixed costs)', () => {
  it('computes gross margin correctly', () => {
    const r = calculateMargin(input())
    // (1000 - 400) / 1000 = 60%
    expect(round(r.grossMargin)).toBe(60)
  })

  it('net margin equals gross margin when tax is 0', () => {
    const r = calculateMargin(input())
    expect(round(r.netMargin)).toBe(round(r.grossMargin))
  })

  it('computes total cost as just variable cost when no fixed costs', () => {
    const r = calculateMargin(input())
    expect(r.totalCost).toBe(400)
    expect(r.fixedPerJob).toBe(0)
  })

  it('computes minimum price for desired margin', () => {
    const r = calculateMargin(input({ desiredMargin: 30 }))
    // 400 / (1 - 0.30) = 571.43
    expect(round(r.minimumPrice)).toBe(571.43)
  })

  it('computes max discount correctly', () => {
    const r = calculateMargin(input({ desiredMargin: 30 }))
    // (1000 - 571.43) / 1000 * 100 = 42.86%
    expect(round(r.maxDiscount)).toBe(42.86)
  })

  it('returns zero tax amount', () => {
    const r = calculateMargin(input())
    expect(r.taxAmount).toBe(0)
  })
})

// ─── Tax calculations ────────────────────────────────────────────

describe('tax calculations', () => {
  it('computes tax amount on service value', () => {
    const r = calculateMargin(input({ taxRate: 5 }))
    // 1000 * 5% = 50
    expect(r.taxAmount).toBe(50)
  })

  it('net margin is reduced by tax', () => {
    const r = calculateMargin(input({ taxRate: 5 }))
    // gross = (1000 - 400) / 1000 = 60%
    // net = (1000 - 400 - 50) / 1000 = 55%
    expect(round(r.grossMargin)).toBe(60)
    expect(round(r.netMargin)).toBe(55)
  })

  it('minimum price accounts for tax in denominator', () => {
    const r = calculateMargin(input({ desiredMargin: 30, taxRate: 5 }))
    // 400 / (1 - 0.30 - 0.05) = 400 / 0.65 = 615.38
    expect(round(r.minimumPrice)).toBe(615.38)
  })

  it('MEI tax rate (5%)', () => {
    const r = calculateMargin(input({ taxRate: 5, serviceValue: 1000, variableCost: 500 }))
    expect(r.taxAmount).toBe(50)
    expect(round(r.netMargin)).toBe(45) // (1000-500-50)/1000
  })

  it('Simples Nacional Anexo III (6%)', () => {
    const r = calculateMargin(input({ taxRate: 6, serviceValue: 1000, variableCost: 500 }))
    expect(r.taxAmount).toBe(60)
    expect(round(r.netMargin)).toBe(44) // (1000-500-60)/1000
  })

  it('Simples Nacional Anexo V (15.5%)', () => {
    const r = calculateMargin(input({ taxRate: 15.5, serviceValue: 1000, variableCost: 500 }))
    expect(r.taxAmount).toBe(155)
    expect(round(r.netMargin)).toBe(34.5) // (1000-500-155)/1000
  })

  it('Lucro Presumido (16.33%)', () => {
    const r = calculateMargin(input({ taxRate: 16.33, serviceValue: 1000, variableCost: 500 }))
    expect(round(r.taxAmount)).toBe(163.3)
    expect(round(r.netMargin)).toBe(33.67) // (1000-500-163.3)/1000
  })
})

// ─── Fixed costs ─────────────────────────────────────────────────

describe('fixed cost calculations', () => {
  it('computes fixed cost per job', () => {
    const r = calculateMargin(input({ fixedCostMonthly: 2000, jobsPerMonth: 20 }))
    expect(r.fixedPerJob).toBe(100)
  })

  it('adds fixed cost per job to total cost', () => {
    const r = calculateMargin(input({ variableCost: 400, fixedCostMonthly: 2000, jobsPerMonth: 20 }))
    // 400 + (2000/20) = 500
    expect(r.totalCost).toBe(500)
  })

  it('reduces gross margin when fixed costs are included', () => {
    const noFixed = calculateMargin(input({ variableCost: 400, fixedCostMonthly: 0 }))
    const withFixed = calculateMargin(input({ variableCost: 400, fixedCostMonthly: 2000, jobsPerMonth: 20 }))
    expect(withFixed.grossMargin).toBeLessThan(noFixed.grossMargin)
    // noFixed: (1000-400)/1000 = 60%
    // withFixed: (1000-500)/1000 = 50%
    expect(round(withFixed.grossMargin)).toBe(50)
  })

  it('minimum price increases when fixed costs are included', () => {
    const noFixed = calculateMargin(input({ desiredMargin: 30, fixedCostMonthly: 0 }))
    const withFixed = calculateMargin(input({ desiredMargin: 30, fixedCostMonthly: 2000, jobsPerMonth: 20 }))
    expect(withFixed.minimumPrice).toBeGreaterThan(noFixed.minimumPrice)
  })

  it('uses jobsPerMonth=1 as floor when 0 is provided', () => {
    const r = calculateMargin(input({ fixedCostMonthly: 1000, jobsPerMonth: 0 }))
    expect(r.fixedPerJob).toBe(1000)
  })

  it('uses jobsPerMonth=1 as floor for negative values', () => {
    const r = calculateMargin(input({ fixedCostMonthly: 1000, jobsPerMonth: -5 }))
    expect(r.fixedPerJob).toBe(1000)
  })
})

// ─── Combined: tax + fixed costs (plan verification scenario) ───

describe('combined tax + fixed costs (plan verification)', () => {
  it('matches the plan verification example exactly', () => {
    // Plan: Serviço R$1.000, custos R$400, margem 30%, imposto MEI 5%,
    //        custos fixos R$2.000/mês, 20 serviços/mês
    const r = calculateMargin(input({
      serviceValue: 1000,
      variableCost: 400,
      fixedCostMonthly: 2000,
      jobsPerMonth: 20,
      desiredMargin: 30,
      taxRate: 5,
    }))

    // Custo fixo/serviço = 100
    expect(r.fixedPerJob).toBe(100)
    // Custo total = 400 + 100 = 500
    expect(r.totalCost).toBe(500)
    // Imposto = 1000 x 5% = 50
    expect(r.taxAmount).toBe(50)
    // Margem líquida = (1000 - 500 - 50) / 1000 = 45%
    expect(round(r.netMargin)).toBe(45)
    // Preço mínimo = 500 / (1 - 0.30 - 0.05) = 500 / 0.65 = 769.23
    expect(round(r.minimumPrice)).toBe(769.23)
  })
})

// ─── Status thresholds ───────────────────────────────────────────

describe('status thresholds (based on net margin)', () => {
  it('returns "safe" when net margin >= 20%', () => {
    const r = calculateMargin(input({ serviceValue: 1000, variableCost: 700, taxRate: 0 }))
    // net = (1000-700)/1000 = 30%
    expect(r.status).toBe('safe')
    expect(r.message).toBe('Excelente margem de lucro!')
  })

  it('returns "safe" at exactly 20% net margin', () => {
    const r = calculateMargin(input({ serviceValue: 1000, variableCost: 800, taxRate: 0 }))
    // net = (1000-800)/1000 = 20%
    expect(r.status).toBe('safe')
  })

  it('returns "warning" when 10% <= net margin < 20%', () => {
    const r = calculateMargin(input({ serviceValue: 1000, variableCost: 850, taxRate: 0 }))
    // net = (1000-850)/1000 = 15%
    expect(r.status).toBe('warning')
    expect(r.message).toBe('Atenção: margem apertada')
  })

  it('returns "warning" at exactly 10% net margin', () => {
    const r = calculateMargin(input({ serviceValue: 1000, variableCost: 900, taxRate: 0 }))
    // net = 10%
    expect(r.status).toBe('warning')
  })

  it('returns "danger" when net margin < 10%', () => {
    const r = calculateMargin(input({ serviceValue: 1000, variableCost: 950, taxRate: 0 }))
    // net = 5%
    expect(r.status).toBe('danger')
    expect(r.message).toBe('Alerta: risco de prejuízo')
  })

  it('returns "danger" for negative net margin', () => {
    const r = calculateMargin(input({ serviceValue: 100, variableCost: 200, taxRate: 5 }))
    expect(r.netMargin).toBeLessThan(0)
    expect(r.status).toBe('danger')
  })

  it('tax can push status from safe to warning', () => {
    // Without tax: net = (1000-800)/1000 = 20% → safe
    const noTax = calculateMargin(input({ serviceValue: 1000, variableCost: 800, taxRate: 0 }))
    expect(noTax.status).toBe('safe')
    // With 5% tax: net = (1000-800-50)/1000 = 15% → warning
    const withTax = calculateMargin(input({ serviceValue: 1000, variableCost: 800, taxRate: 5 }))
    expect(withTax.status).toBe('warning')
  })
})

// ─── Edge cases ──────────────────────────────────────────────────

describe('edge cases', () => {
  it('100% desired margin → infinite minimum price', () => {
    const r = calculateMargin(input({ desiredMargin: 100 }))
    expect(r.minimumPrice).toBe(Number.POSITIVE_INFINITY)
  })

  it('margin + tax >= 100% → infinite minimum price', () => {
    const r = calculateMargin(input({ desiredMargin: 50, taxRate: 50 }))
    expect(r.minimumPrice).toBe(Number.POSITIVE_INFINITY)
  })

  it('margin + tax > 100% → infinite minimum price', () => {
    const r = calculateMargin(input({ desiredMargin: 60, taxRate: 50 }))
    expect(r.minimumPrice).toBe(Number.POSITIVE_INFINITY)
  })

  it('zero service value → uses safeSvc=1 (no division by zero)', () => {
    const r = calculateMargin(input({ serviceValue: 0, variableCost: 100 }))
    // Should not throw or produce NaN
    expect(Number.isFinite(r.grossMargin)).toBe(true)
    expect(Number.isFinite(r.netMargin)).toBe(true)
  })

  it('zero variable cost → margin is 100% minus tax', () => {
    const r = calculateMargin(input({ serviceValue: 1000, variableCost: 0, taxRate: 10 }))
    expect(round(r.grossMargin)).toBe(100)
    expect(round(r.netMargin)).toBe(90)
  })

  it('zero everything → no crash', () => {
    const r = calculateMargin(input({
      serviceValue: 0,
      variableCost: 0,
      fixedCostMonthly: 0,
      jobsPerMonth: 0,
      desiredMargin: 0,
      taxRate: 0,
    }))
    expect(Number.isFinite(r.grossMargin)).toBe(true)
    expect(Number.isFinite(r.netMargin)).toBe(true)
    expect(r.taxAmount).toBe(0)
  })

  it('negative tax rate is clamped to 0', () => {
    const r = calculateMargin(input({ taxRate: -10 }))
    expect(r.taxAmount).toBe(0)
  })

  it('tax rate > 100 is clamped to 100', () => {
    const r = calculateMargin(input({ taxRate: 150, serviceValue: 1000 }))
    expect(r.taxAmount).toBe(1000) // 100% of service value
  })

  it('negative desired margin is clamped to 0', () => {
    const r = calculateMargin(input({ desiredMargin: -20 }))
    // min price with 0% margin = totalCost / 1 = totalCost
    expect(round(r.minimumPrice)).toBe(r.totalCost)
  })

  it('desired margin > 100 is clamped to 100', () => {
    const r = calculateMargin(input({ desiredMargin: 150 }))
    expect(r.minimumPrice).toBe(Number.POSITIVE_INFINITY)
  })

  it('very large service value does not overflow', () => {
    const r = calculateMargin(input({ serviceValue: 1_000_000_000, variableCost: 500_000_000 }))
    expect(Number.isFinite(r.grossMargin)).toBe(true)
    expect(round(r.grossMargin)).toBe(50)
  })

  it('very small fractional values work', () => {
    const r = calculateMargin(input({ serviceValue: 0.01, variableCost: 0.005, taxRate: 0 }))
    expect(round(r.grossMargin)).toBe(50)
  })
})

// ─── Max discount correctness ────────────────────────────────────

describe('max discount', () => {
  it('is 0 when service value equals minimum price', () => {
    // 400 / (1 - 0.30) = 571.43 → set serviceValue to that
    const minPrice = 400 / 0.7
    const r = calculateMargin(input({ serviceValue: minPrice, variableCost: 400, desiredMargin: 30 }))
    expect(round(r.maxDiscount)).toBe(0)
  })

  it('is negative when service value is below minimum price', () => {
    const r = calculateMargin(input({ serviceValue: 100, variableCost: 400, desiredMargin: 30 }))
    expect(r.maxDiscount).toBeLessThan(0)
  })

  it('increases when service value is well above minimum price', () => {
    const r = calculateMargin(input({ serviceValue: 2000, variableCost: 400, desiredMargin: 30 }))
    // minPrice = 400/0.7 = 571.43
    // discount = (2000 - 571.43) / 2000 * 100 = 71.43%
    expect(round(r.maxDiscount)).toBe(71.43)
  })
})

// ─── Gross vs net margin relationship ────────────────────────────

describe('gross vs net margin relationship', () => {
  it('net margin <= gross margin when tax > 0', () => {
    const r = calculateMargin(input({ taxRate: 10 }))
    expect(r.netMargin).toBeLessThanOrEqual(r.grossMargin)
  })

  it('net margin == gross margin when tax == 0', () => {
    const r = calculateMargin(input({ taxRate: 0 }))
    expect(round(r.netMargin)).toBe(round(r.grossMargin))
  })

  it('difference between gross and net equals tax rate (% of service value)', () => {
    const r = calculateMargin(input({ taxRate: 10, serviceValue: 1000 }))
    // gross - net should equal taxRate when denominator is serviceValue
    expect(round(r.grossMargin - r.netMargin)).toBe(10)
  })
})
