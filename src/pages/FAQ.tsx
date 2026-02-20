import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Header } from '@/components/layout/Header'
import { BlockMath } from 'react-katex'

const FAQ = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-3 sm:p-6 py-6">
        <Card className="rounded-xl bg-white border p-3 sm:p-6">
          <CardHeader className="p-0 sm:p-6 pb-2">
            <CardTitle className="text-primary">FAQ — Perguntas frequentes</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <p className="text-sm text-muted-foreground mb-4">Explicações simples sobre margem, preço mínimo, desconto máximo e como usar a calculadora. Exemplos incluídos.</p>
            <Accordion type="single" collapsible className="w-full space-y-2">
              <AccordionItem value="item-templates" className="rounded-lg bg-background/70 border">
                <AccordionTrigger className="px-3 rounded-lg hover:bg-background/90">O que são os modelos?</AccordionTrigger>
                <AccordionContent className="px-3 pb-3 text-sm text-muted-foreground space-y-3">
                  <p>
                    Os modelos são <strong>templates prontos</strong> para diferentes tipos de negócio (confeitaria, consultoria, freelancer, etc.).
                    Cada modelo já vem com itens de custo típicos daquele segmento, facilitando o preenchimento.
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Prestador de Serviço</strong>: Deslocamento, Materiais, Mão de obra.</li>
                    <li><strong>Confeitaria / Doces</strong>: Ingredientes, Embalagem, Gás/Energia, Mão de obra.</li>
                    <li><strong>Consultoria</strong>: Deslocamento, Materiais, Horas de consultoria.</li>
                    <li><strong>Produto Artesanal</strong>: Materiais, Embalagem, Mão de obra.</li>
                    <li><strong>Freelancer / TI</strong>: Ferramentas/Software, Internet, Horas de trabalho.</li>
                    <li><strong>Personalizado</strong>: vazio — monte seus próprios itens de custo.</li>
                  </ul>
                  <p>Você sempre pode adicionar, remover ou renomear itens de custo, independentemente do modelo escolhido.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-1" className="rounded-lg bg-background/70 border">
                <AccordionTrigger className="px-3 rounded-lg hover:bg-background/90">Para que serve a Margem desejada?</AccordionTrigger>
                <AccordionContent className="px-3 pb-3 text-sm text-muted-foreground space-y-3">
                  <p>
                    É a <strong>margem de lucro-alvo</strong> (em %) que você quer atingir <strong>sobre o preço de venda</strong>.
                    Ela <strong>não muda a sua margem atual</strong>. Serve para calcular:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Preço mínimo</strong> que você deve cobrar para atingir a margem desejada.</li>
                    <li><strong>Desconto máximo</strong> que pode conceder sem ficar abaixo dessa margem.</li>
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
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="rounded-lg bg-background/70 border">
                <AccordionTrigger className="px-3 rounded-lg hover:bg-background/90">Por que 100% de margem é indefinido?</AccordionTrigger>
                <AccordionContent className="px-3 pb-3 text-sm text-muted-foreground space-y-3">
                  <p>
                    Porque a fórmula divide por <code>(1 − margem)</code>. Com 100%, esse termo vira 0 (não existe divisão por zero).
                  </p>
                  <div className="overflow-x-auto">
                    <BlockMath>{String.raw`\text{Preço mínimo} = \dfrac{\text{Custo total}}{1 - 1}`}</BlockMath>
                  </div>
                  <p>
                    Se você pensou em "<strong>dobrar o custo</strong>", isso não é 100% de margem — é <strong>100% de markup</strong>, que equivale a <strong>50% de margem</strong>.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="rounded-lg bg-background/70 border">
                <AccordionTrigger className="px-3 rounded-lg hover:bg-background/90">Qual a diferença entre Margem e Markup?</AccordionTrigger>
                <AccordionContent className="px-3 pb-3 text-sm text-muted-foreground space-y-3">
                  <div>
                    <p><strong>Margem (sobre o preço)</strong>:</p>
                    <div className="overflow-x-auto">
                      <BlockMath>{String.raw`\text{Margem} = \dfrac{\text{Preço} - \text{Custo}}{\text{Preço}}`}</BlockMath>
                    </div>
                  </div>
                  <div>
                    <p><strong>Markup (sobre o custo)</strong>:</p>
                    <div className="overflow-x-auto">
                      <BlockMath>{String.raw`\text{Markup} = \dfrac{\text{Preço} - \text{Custo}}{\text{Custo}}`}</BlockMath>
                    </div>
                  </div>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>100% de markup ⇒ 50% de margem (dobrar o custo).</li>
                    <li>50% de markup ⇒ ~33,33% de margem.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4" className="rounded-lg bg-background/70 border">
                <AccordionTrigger className="px-3 rounded-lg hover:bg-background/90">Como preencher os campos?</AccordionTrigger>
                <AccordionContent className="px-3 pb-3 text-sm text-muted-foreground space-y-2">
                  <p>Ao escolher um modelo, a calculadora já traz itens de custo típicos do segmento. Cada item pode ser de um destes tipos:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Valor (R$)</strong>: um custo direto em reais (ex.: deslocamento, ingredientes).</li>
                    <li><strong>Horas x R$/h</strong>: quantidade de horas multiplicada pelo valor por hora (ex.: mão de obra).</li>
                    <li><strong>Qtd x Preço unit.</strong>: quantidade de unidades vezes preço unitário.</li>
                  </ul>
                  <p>Você pode <strong>adicionar</strong>, <strong>remover</strong> ou <strong>renomear</strong> itens livremente.</p>
                  <p>Preencha também o <strong>Valor do Serviço</strong> (quanto pretende cobrar) e a <strong>Margem desejada</strong> para ver o preço mínimo e o desconto máximo.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5" className="rounded-lg bg-background/70 border">
                <AccordionTrigger className="px-3 rounded-lg hover:bg-background/90">Exemplo prático completo</AccordionTrigger>
                <AccordionContent className="px-3 pb-3 text-sm text-muted-foreground space-y-3">
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
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default FAQ
