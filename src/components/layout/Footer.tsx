import { Link } from "react-router-dom";
import { Calculator, HelpCircle, History } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-secondary/30 mt-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          {/* Brand + description */}
          <div className="max-w-md">
            <p className="font-bold text-foreground">Margem Forte</p>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Calculadora gratuita de margem de lucro para pequenos negócios
              brasileiros. Inclua custos fixos, variáveis e impostos (MEI,
              Simples Nacional, Lucro Presumido) para descobrir a margem real, o
              preço mínimo de venda e o desconto máximo que você pode oferecer.
            </p>
            <p className="text-xs text-muted-foreground/70 mt-3">
              Seus dados ficam no seu navegador. Nenhuma informação é enviada a
              servidores.
            </p>
          </div>

          {/* Navigation links */}
          <nav aria-label="Rodapé" className="flex flex-col gap-2 text-sm">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Calculator className="h-3.5 w-3.5" />
              Calculadora
            </Link>
            <Link
              to="/faq"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              Perguntas Frequentes
            </Link>
            <Link
              to="/historico"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <History className="h-3.5 w-3.5" />
              Histórico de Simulações
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
