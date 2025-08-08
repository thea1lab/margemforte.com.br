import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Header } from '@/components/layout/Header'
import { BlockMath } from 'react-katex'

const FAQ = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto p-6">
        <Card className="rounded-xl p-6 bg-white border">
          <CardHeader className="pb-2">
            <CardTitle className="text-primary">FAQ — Perguntas frequentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Explicações simples sobre margem, preço mínimo, desconto máximo e como preencher os campos. Exemplos incluídos.</p>
            <Accordion type="single" collapsible className="w-full space-y-2">
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
                    <BlockMath>{String.raw`\text{Preço mínimo} = \dfrac{\text{Custo total}}{1 - \text{Margem}}`}</BlockMath>
                    <p>Exemplo rápido: Custo total = R$ 100 e margem desejada = 40%</p>
                    <BlockMath>{String.raw`\text{Preço mínimo} = \dfrac{100}{1 - 0{,}40} = 166{,}67`}</BlockMath>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="rounded-lg bg-background/70 border">
                <AccordionTrigger className="px-3 rounded-lg hover:bg-background/90">Por que 100% de margem é indefinido?</AccordionTrigger>
                <AccordionContent className="px-3 pb-3 text-sm text-muted-foreground space-y-3">
                  <p>
                    Porque a fórmula divide por <code>(1 − margem)</code>. Com 100%, esse termo vira 0 (não existe divisão por zero).
                  </p>
                  <BlockMath>{String.raw`\text{Preço mínimo} = \dfrac{\text{Custo total}}{1 - 1}`}</BlockMath>
                  <p>
                    Se você pensou em “<strong>dobrar o custo</strong>”, isso não é 100% de margem — é <strong>100% de markup</strong>, que equivale a <strong>50% de margem</strong>.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="rounded-lg bg-background/70 border">
                <AccordionTrigger className="px-3 rounded-lg hover:bg-background/90">Qual a diferença entre Margem e Markup?</AccordionTrigger>
                <AccordionContent className="px-3 pb-3 text-sm text-muted-foreground space-y-3">
                  <div>
                    <p><strong>Margem (sobre o preço)</strong>:</p>
                    <BlockMath>{String.raw`\text{Margem} = \dfrac{\text{Preço} - \text{Custo}}{\text{Preço}}`}</BlockMath>
                  </div>
                  <div>
                    <p><strong>Markup (sobre o custo)</strong>:</p>
                    <BlockMath>{String.raw`\text{Markup} = \dfrac{\text{Preço} - \text{Custo}}{\text{Custo}}`}</BlockMath>
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
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Valor do Serviço</strong>: quanto você pretende cobrar do cliente.</li>
                    <li><strong>Deslocamento</strong>: transporte, combustível, pedágio, estadia.</li>
                    <li><strong>Materiais</strong>: peças e insumos usados no serviço.</li>
                    <li><strong>Horas</strong>: horas estimadas para executar o serviço.</li>
                    <li><strong>R$/h</strong>: seu preço por hora de trabalho.</li>
                  </ul>
                  <p>Dica: Preencha os custos primeiro; depois use a Margem desejada para ver o preço mínimo e o desconto máximo.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5" className="rounded-lg bg-background/70 border">
                <AccordionTrigger className="px-3 rounded-lg hover:bg-background/90">Exemplo prático completo</AccordionTrigger>
                <AccordionContent className="px-3 pb-3 text-sm text-muted-foreground space-y-3">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Deslocamento: R$ 20</li>
                    <li>Materiais: R$ 30</li>
                    <li>Horas: 5</li>
                    <li>R$/h: R$ 10</li>
                  </ul>
                  <p>1) Calcular o custo total:</p>
                  <BlockMath>{String.raw`\text{Custo total} = 20 + (5 \times 10) + 30 = 100`}</BlockMath>
                  <p>2) Com margem desejada de 40%, preço mínimo:</p>
                  <BlockMath>{String.raw`\text{Preço mínimo} = \dfrac{100}{1 - 0{,}40} = 166{,}67`}</BlockMath>
                  <p>3) Se você cobrar R$ 180, a sua margem atual será:</p>
                  <BlockMath>{String.raw`\%\,\text{Margem} = \dfrac{180 - 100}{180} \times 100 = 44{,}44\%`}</BlockMath>
                  <p>4) Desconto máximo mantendo 40% de margem (sobre R$ 180):</p>
                  <BlockMath>{String.raw`\%\,\text{Desconto máx.} = \dfrac{180 - 166{,}67}{180} \times 100 = 7{,}41\%`}</BlockMath>
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


