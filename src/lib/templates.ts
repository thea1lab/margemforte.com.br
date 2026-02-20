import type { CostItemType } from './storage'

export interface TemplateCostItem {
  label: string
  type: CostItemType
}

export interface Template {
  id: string
  name: string
  description: string
  icon: string
  defaultCostItems: TemplateCostItem[]
}

export const templates: Template[] = [
  {
    id: 'prestador',
    name: 'Prestador de Serviço',
    description: 'Serviços gerais, manutenção, instalações',
    icon: 'Wrench',
    defaultCostItems: [
      { label: 'Deslocamento', type: 'currency' },
      { label: 'Materiais', type: 'currency' },
      { label: 'Mão de obra', type: 'hours_rate' },
    ],
  },
  {
    id: 'confeitaria',
    name: 'Confeitaria / Doces',
    description: 'Bolos, doces, salgados, encomendas',
    icon: 'CakeSlice',
    defaultCostItems: [
      { label: 'Ingredientes', type: 'currency' },
      { label: 'Embalagem', type: 'currency' },
      { label: 'Gás/Energia', type: 'currency' },
      { label: 'Mão de obra', type: 'hours_rate' },
    ],
  },
  {
    id: 'consultoria',
    name: 'Consultoria',
    description: 'Consultoria técnica, financeira, empresarial',
    icon: 'Briefcase',
    defaultCostItems: [
      { label: 'Deslocamento', type: 'currency' },
      { label: 'Materiais', type: 'currency' },
      { label: 'Horas de consultoria', type: 'hours_rate' },
    ],
  },
  {
    id: 'artesanal',
    name: 'Produto Artesanal',
    description: 'Artesanato, bijuterias, costura, crochê',
    icon: 'Palette',
    defaultCostItems: [
      { label: 'Materiais', type: 'currency' },
      { label: 'Embalagem', type: 'currency' },
      { label: 'Mão de obra', type: 'hours_rate' },
    ],
  },
  {
    id: 'freelancer',
    name: 'Freelancer / TI',
    description: 'Desenvolvimento, design, marketing digital',
    icon: 'Monitor',
    defaultCostItems: [
      { label: 'Ferramentas/Software', type: 'currency' },
      { label: 'Internet', type: 'currency' },
      { label: 'Horas de trabalho', type: 'hours_rate' },
    ],
  },
  {
    id: 'personalizado',
    name: 'Personalizado',
    description: 'Monte seus próprios itens de custo',
    icon: 'Settings',
    defaultCostItems: [],
  },
]

export function getTemplate(id: string): Template | undefined {
  return templates.find((t) => t.id === id)
}
