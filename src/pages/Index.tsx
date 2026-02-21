import { Helmet } from "react-helmet-async";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MarginCalculator } from "@/components/calculator/MarginCalculator";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background">
      <Helmet>
        <title>Calculadora de Margem de Lucro Grátis · Margem Forte</title>
        <meta
          name="description"
          content="Calcule a margem de lucro real do seu negócio incluindo custos fixos, variáveis e impostos (MEI, Simples Nacional, Lucro Presumido). Descubra o preço mínimo de venda e o desconto máximo. Ferramenta gratuita para prestadores de serviço, confeiteiros, artesãos e freelancers."
        />
        <link rel="canonical" href="https://margemforte.com.br/" />
        <meta
          property="og:title"
          content="Calculadora de Margem de Lucro Grátis · Margem Forte"
        />
        <meta
          property="og:description"
          content="Descubra a margem real do seu negócio. Inclua custos fixos, variáveis e impostos para não errar na precificação. Gratuita, sem cadastro."
        />
        <meta property="og:url" content="https://margemforte.com.br/" />
      </Helmet>
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <MarginCalculator />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
