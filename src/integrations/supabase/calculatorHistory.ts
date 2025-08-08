import { supabase } from '@/integrations/supabase/client'

export type CalculatorHistoryInsert = {
  simulation_name: string
  service_value: number
  travel_costs: number
  hours_worked: number
  hourly_rate: number
  materials: number
  desired_margin: number
}

export async function saveCalculatorHistory(data: CalculatorHistoryInsert) {
  const { data: inserted, error } = await supabase
    .from('calculator_history')
    .insert([data])
    .select()
    .single()

  if (error) throw error
  return inserted
}

export async function updateCalculatorHistory(id: string, data: Partial<CalculatorHistoryInsert>) {
  const { error } = await supabase
    .from('calculator_history')
    .update(data)
    .eq('id', id)

  if (error) throw error
  return { id }
}


