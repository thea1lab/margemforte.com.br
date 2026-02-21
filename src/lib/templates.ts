import type { CostItemType } from "./storage";

export interface TemplateCostItem {
  label: string;
  type: CostItemType;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  defaultCostItems: TemplateCostItem[];
  suggestedTaxRegime?: string;
  suggestedFixedCosts?: string[];
}

export const templates: Template[] = [
  {
    id: "prestador",
    name: "Prestador de Serviço",
    description:
      "Calcule a margem para serviços gerais, manutenção, instalações e reparos",
    icon: "Wrench",
    defaultCostItems: [
      { label: "Deslocamento", type: "currency" },
      { label: "Materiais", type: "currency" },
      { label: "Mão de obra", type: "hours_rate" },
    ],
    suggestedTaxRegime: "mei",
    suggestedFixedCosts: ["Aluguel/Espaço", "Seguro", "Contador"],
  },
  {
    id: "confeitaria",
    name: "Confeitaria / Doces",
    description:
      "Precifique bolos, doces, salgados e encomendas com todos os custos",
    icon: "CakeSlice",
    defaultCostItems: [
      { label: "Ingredientes", type: "currency" },
      { label: "Embalagem", type: "currency" },
      { label: "Gás/Energia", type: "currency" },
      { label: "Mão de obra", type: "hours_rate" },
    ],
    suggestedTaxRegime: "mei",
    suggestedFixedCosts: ["Aluguel da cozinha", "Energia elétrica", "Contador"],
  },
  {
    id: "consultoria",
    name: "Consultoria",
    description:
      "Margem de lucro para consultoria técnica, financeira e empresarial",
    icon: "Briefcase",
    defaultCostItems: [
      { label: "Deslocamento", type: "currency" },
      { label: "Materiais", type: "currency" },
      { label: "Horas de consultoria", type: "hours_rate" },
    ],
    suggestedTaxRegime: "simples_6",
    suggestedFixedCosts: ["Escritório/Coworking", "Software", "Contador"],
  },
  {
    id: "artesanal",
    name: "Produto Artesanal",
    description:
      "Precificação para artesanato, bijuterias, costura, crochê e produtos feitos à mão",
    icon: "Palette",
    defaultCostItems: [
      { label: "Materiais", type: "currency" },
      { label: "Embalagem", type: "currency" },
      { label: "Mão de obra", type: "hours_rate" },
    ],
    suggestedTaxRegime: "mei",
    suggestedFixedCosts: ["Espaço/Ateliê", "Energia", "Contador"],
  },
  {
    id: "freelancer",
    name: "Freelancer / TI",
    description:
      "Calcule quanto cobrar por projetos de desenvolvimento, design e marketing digital",
    icon: "Monitor",
    defaultCostItems: [
      { label: "Ferramentas/Software", type: "currency" },
      { label: "Internet", type: "currency" },
      { label: "Horas de trabalho", type: "hours_rate" },
    ],
    suggestedTaxRegime: "simples_6",
    suggestedFixedCosts: ["Aluguel", "Energia", "Contador"],
  },
  {
    id: "personalizado",
    name: "Personalizado",
    description:
      "Monte seus próprios itens de custo para qualquer tipo de negócio",
    icon: "Settings",
    defaultCostItems: [],
  },
];

export function getTemplate(id: string): Template | undefined {
  return templates.find((t) => t.id === id);
}
