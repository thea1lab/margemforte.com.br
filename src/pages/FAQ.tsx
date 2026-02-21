import { Helmet } from "react-helmet-async";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BlockMath } from "react-katex";
import {
  HelpCircle,
  LayoutTemplate,
  Target,
  Infinity,
  ArrowLeftRight,
  ClipboardList,
  BookOpen,
  Receipt,
  Building2,
  TrendingUp,
} from "lucide-react";

const faqItems = [
  {
    value: "item-templates",
    icon: LayoutTemplate,
    question: "O que são os modelos?",
    content: (
      <div className="space-y-3">
        <p>
          Os modelos são <strong>templates prontos</strong> para diferentes
          tipos de negócio (confeitaria, consultoria, freelancer, etc.). Cada
          modelo já vem com itens de custo típicos daquele segmento, facilitando
          o preenchimento.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Prestador de Serviço</strong>: Deslocamento, Materiais, Mão
            de obra.
          </li>
          <li>
            <strong>Confeitaria / Doces</strong>: Ingredientes, Embalagem,
            Gás/Energia, Mão de obra.
          </li>
          <li>
            <strong>Consultoria</strong>: Deslocamento, Materiais, Horas de
            consultoria.
          </li>
          <li>
            <strong>Produto Artesanal</strong>: Materiais, Embalagem, Mão de
            obra.
          </li>
          <li>
            <strong>Freelancer / TI</strong>: Ferramentas/Software, Internet,
            Horas de trabalho.
          </li>
          <li>
            <strong>Personalizado</strong>: vazio - monte seus próprios itens de
            custo.
          </li>
        </ul>
        <p>
          Você sempre pode adicionar, remover ou renomear itens de custo,
          independentemente do modelo escolhido.
        </p>
      </div>
    ),
  },
  {
    value: "item-1",
    icon: Target,
    question: "Para que serve a Margem desejada?",
    content: (
      <div className="space-y-3">
        <p>
          É a <strong>margem de lucro-alvo</strong> (em %) que você quer atingir{" "}
          <strong>sobre o preço de venda</strong>. Ela{" "}
          <strong>não muda a sua margem atual</strong>. Serve para calcular:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Preço mínimo</strong> que você deve cobrar para atingir a
            margem desejada.
          </li>
          <li>
            <strong>Desconto máximo</strong> que pode conceder sem ficar abaixo
            dessa margem.
          </li>
        </ul>
        <div className="space-y-2">
          <p>Fórmula:</p>
          <div className="overflow-x-auto">
            <BlockMath>{String.raw`\text{Preço mínimo} = \dfrac{\text{Custo total}}{1 - \text{Margem}}`}</BlockMath>
          </div>
          <p>Exemplo rápido: Custo total = R$ 100 e margem desejada = 40%</p>
          <div className="overflow-x-auto">
            <BlockMath>{String.raw`\text{Preço mínimo} = \dfrac{100}{1 - 0{,}40} = 166{,}67`}</BlockMath>
          </div>
        </div>
      </div>
    ),
  },
  {
    value: "item-2",
    icon: Infinity,
    question: "Por que 100% de margem é indefinido?",
    content: (
      <div className="space-y-3">
        <p>
          Porque a fórmula divide por{" "}
          <code className="bg-secondary px-1.5 py-0.5 rounded text-sm">
            (1 − margem)
          </code>
          . Com 100%, esse termo vira 0 (não existe divisão por zero).
        </p>
        <div className="overflow-x-auto">
          <BlockMath>{String.raw`\text{Preço mínimo} = \dfrac{\text{Custo total}}{1 - 1}`}</BlockMath>
        </div>
        <p>
          Se você pensou em "<strong>dobrar o custo</strong>", isso não é 100%
          de margem - é <strong>100% de markup</strong>, que equivale a{" "}
          <strong>50% de margem</strong>.
        </p>
      </div>
    ),
  },
  {
    value: "item-3",
    icon: ArrowLeftRight,
    question: "Qual a diferença entre Margem e Markup?",
    content: (
      <div className="space-y-3">
        <div>
          <p>
            <strong>Margem (sobre o preço)</strong>:
          </p>
          <div className="overflow-x-auto">
            <BlockMath>{String.raw`\text{Margem} = \dfrac{\text{Preço} - \text{Custo}}{\text{Preço}}`}</BlockMath>
          </div>
        </div>
        <div>
          <p>
            <strong>Markup (sobre o custo)</strong>:
          </p>
          <div className="overflow-x-auto">
            <BlockMath>{String.raw`\text{Markup} = \dfrac{\text{Preço} - \text{Custo}}{\text{Custo}}`}</BlockMath>
          </div>
        </div>
        <ul className="list-disc pl-5 space-y-1">
          <li>100% de markup ⇒ 50% de margem (dobrar o custo).</li>
          <li>50% de markup ⇒ ~33,33% de margem.</li>
        </ul>
      </div>
    ),
  },
  {
    value: "item-4",
    icon: ClipboardList,
    question: "Como preencher os campos?",
    content: (
      <div className="space-y-2">
        <p>
          Ao escolher um modelo, a calculadora já traz itens de custo típicos do
          segmento. Cada item pode ser de um destes tipos:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Valor (R$)</strong>: um custo direto em reais (ex.:
            deslocamento, ingredientes).
          </li>
          <li>
            <strong>Horas x R$/h</strong>: quantidade de horas multiplicada pelo
            valor por hora (ex.: mão de obra).
          </li>
          <li>
            <strong>Qtd x Preço unit.</strong>: quantidade de unidades vezes
            preço unitário.
          </li>
        </ul>
        <p>
          Você pode <strong>adicionar</strong>, <strong>remover</strong> ou{" "}
          <strong>renomear</strong> itens livremente.
        </p>
        <p>
          Preencha também o <strong>Valor do Serviço</strong> (quanto pretende
          cobrar) e a <strong>Margem desejada</strong> para ver o preço mínimo e
          o desconto máximo.
        </p>
      </div>
    ),
  },
  {
    value: "item-5",
    icon: BookOpen,
    question: "Exemplo prático completo",
    content: (
      <div className="space-y-3">
        <p>Suponha um prestador de serviço com os custos:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Deslocamento: R$ 20</li>
          <li>Materiais: R$ 30</li>
          <li>Mão de obra: 5 horas x R$ 10/h</li>
        </ul>
        <p>1) Calcular o custo total:</p>
        <div className="overflow-x-auto">
          <BlockMath>{String.raw`\text{Custo total} = 20 + 30 + (5 \times 10) = 100`}</BlockMath>
        </div>
        <p>2) Com margem desejada de 40%, preço mínimo:</p>
        <div className="overflow-x-auto">
          <BlockMath>{String.raw`\text{Preço mínimo} = \dfrac{100}{1 - 0{,}40} = 166{,}67`}</BlockMath>
        </div>
        <p>3) Se você cobrar R$ 180, a sua margem atual será:</p>
        <div className="overflow-x-auto">
          <BlockMath>{String.raw`\%\,\text{Margem} = \dfrac{180 - 100}{180} \times 100 = 44{,}44\%`}</BlockMath>
        </div>
        <p>4) Desconto máximo mantendo 40% de margem (sobre R$ 180):</p>
        <div className="overflow-x-auto">
          <BlockMath>{String.raw`\%\,\text{Desconto máx.} = \dfrac{180 - 166{,}67}{180} \times 100 = 7{,}41\%`}</BlockMath>
        </div>
      </div>
    ),
  },
  {
    value: "item-impostos",
    icon: Receipt,
    question: "Como incluir impostos no cálculo?",
    content: (
      <div className="space-y-3">
        <p>
          A calculadora possui um campo de{" "}
          <strong>Impostos sobre o serviço</strong> com presets dos principais
          regimes tributários brasileiros:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>MEI</strong>: ~5% (DAS fixo simplificado).
          </li>
          <li>
            <strong>Simples Nacional (Anexo III)</strong>: ~6% (serviços
            gerais).
          </li>
          <li>
            <strong>Simples Nacional (Anexo V)</strong>: ~15,5% (serviços
            intelectuais).
          </li>
          <li>
            <strong>Lucro Presumido</strong>: ~16,33% (ISS + PIS + COFINS + IRPJ
            + CSLL).
          </li>
          <li>
            <strong>Personalizado</strong>: informe a alíquota exata fornecida
            pelo seu contador.
          </li>
        </ul>
        <p>
          O imposto é aplicado sobre o <strong>valor do serviço</strong> (preço
          de venda), e a margem líquida é calculada assim:
        </p>
        <div className="overflow-x-auto">
          <BlockMath>{String.raw`\text{Margem líq.} = \dfrac{\text{Valor} - \text{Custo total} - \text{Impostos}}{\text{Valor}} \times 100`}</BlockMath>
        </div>
        <p>Exemplo: Serviço de R$ 1.000, custo total R$ 500, MEI (5%):</p>
        <div className="overflow-x-auto">
          <BlockMath>{String.raw`\text{Impostos} = 1000 \times 0{,}05 = 50`}</BlockMath>
        </div>
        <div className="overflow-x-auto">
          <BlockMath>{String.raw`\text{Margem líq.} = \dfrac{1000 - 500 - 50}{1000} \times 100 = 45\%`}</BlockMath>
        </div>
      </div>
    ),
  },
  {
    value: "item-custos-fixos",
    icon: Building2,
    question: "Por que incluir custos fixos?",
    content: (
      <div className="space-y-3">
        <p>
          Custos fixos são despesas que você paga <strong>todo mês</strong>,
          independentemente de quantos serviços realiza. Se não incluí-los, sua
          margem parece maior do que realmente é.
        </p>
        <p>Exemplos comuns de custos fixos:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Aluguel do espaço/escritório</li>
          <li>Energia elétrica e internet</li>
          <li>Honorários do contador</li>
          <li>Seguros e licenças</li>
          <li>Assinaturas de software</li>
        </ul>
        <p>A calculadora faz o rateio proporcional automaticamente:</p>
        <div className="overflow-x-auto">
          <BlockMath>{String.raw`\text{Custo fixo por serviço} = \dfrac{\text{Total custos fixos mensais}}{\text{Quantidade de serviços por mês}}`}</BlockMath>
        </div>
        <p>
          Exemplo: R$ 2.000/mês de custos fixos e 20 serviços/mês ={" "}
          <strong>R$ 100 de custo fixo por serviço</strong>.
        </p>
      </div>
    ),
  },
  {
    value: "item-bruta-vs-liquida",
    icon: TrendingUp,
    question: "Margem bruta vs margem líquida",
    content: (
      <div className="space-y-3">
        <div>
          <p>
            <strong>Margem bruta</strong>: considera apenas o custo total
            (variável + fixo), sem impostos.
          </p>
          <div className="overflow-x-auto">
            <BlockMath>{String.raw`\text{Margem bruta} = \dfrac{\text{Valor} - \text{Custo total}}{\text{Valor}} \times 100`}</BlockMath>
          </div>
        </div>
        <div>
          <p>
            <strong>Margem líquida</strong>: desconta também os impostos - é o
            que sobra <strong>de fato</strong> no seu bolso.
          </p>
          <div className="overflow-x-auto">
            <BlockMath>{String.raw`\text{Margem líquida} = \dfrac{\text{Valor} - \text{Custo total} - \text{Impostos}}{\text{Valor}} \times 100`}</BlockMath>
          </div>
        </div>
        <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 text-sm">
          <strong>Atenção:</strong> muitos negócios parecem lucrativos pela
          margem bruta, mas operam em prejuízo quando se consideram os impostos.
          Sempre analise a <strong>margem líquida</strong> para tomar decisões.
        </div>
      </div>
    ),
  },
];

const FAQ = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background">
      <Helmet>
        <title>
          Como Calcular Margem de Lucro · Perguntas Frequentes · Margem Forte
        </title>
        <meta
          name="description"
          content="Tire suas dúvidas sobre margem de lucro, markup, impostos (MEI, Simples Nacional), custos fixos e variáveis. Exemplos práticos de precificação para confeiteiros, freelancers e prestadores de serviço."
        />
        <link rel="canonical" href="https://margemforte.com.br/faq" />
        <meta
          property="og:title"
          content="Como Calcular Margem de Lucro · Perguntas Frequentes · Margem Forte"
        />
        <meta
          property="og:description"
          content="Tire suas dúvidas sobre margem de lucro, markup, impostos e precificação. Exemplos práticos para pequenos negócios."
        />
        <meta property="og:url" content="https://margemforte.com.br/faq" />
      </Helmet>
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Hero banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(235,55%,20%)] via-[hsl(245,50%,30%)] to-[hsl(255,45%,35%)] px-6 py-12 sm:px-10 sm:py-16 text-center mb-8">
          <div className="absolute top-[-60px] right-[-40px] w-[200px] h-[200px] rounded-full bg-white/5" />
          <div className="absolute bottom-[-80px] left-[-60px] w-[250px] h-[250px] rounded-full bg-white/5" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur text-white/90 text-sm font-medium mb-6">
              <HelpCircle className="h-4 w-4" />
              Central de Ajuda
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Perguntas Frequentes
            </h2>
            <p className="text-white/70 mt-4 text-base sm:text-lg max-w-2xl mx-auto">
              Explicações simples sobre margem, preço mínimo, desconto máximo e
              como usar a calculadora.
            </p>
          </div>
        </div>

        {/* Accordion */}
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqItems.map((item) => {
            const Icon = item.icon;
            return (
              <AccordionItem
                key={item.value}
                value={item.value}
                className="rounded-2xl bg-white shadow-soft border-0 data-[state=open]:shadow-medium transition-shadow"
              >
                <AccordionTrigger className="px-6 py-5 text-base font-semibold hover:no-underline gap-3 [&>svg]:shrink-0">
                  <span className="flex items-center gap-3 text-left">
                    <span className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-primary" />
                    </span>
                    {item.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 text-sm text-muted-foreground">
                  {item.content}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
