import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "@/components/layout/Header";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(235,55%,20%)] via-[hsl(245,50%,30%)] to-[hsl(255,45%,35%)] px-6 py-16 sm:px-10 sm:py-20 text-center">
          <div className="absolute top-[-60px] right-[-40px] w-[200px] h-[200px] rounded-full bg-white/5" />
          <div className="absolute bottom-[-80px] left-[-60px] w-[250px] h-[250px] rounded-full bg-white/5" />

          <div className="relative z-10">
            <h1 className="text-7xl sm:text-8xl font-extrabold text-white tracking-tight">404</h1>
            <p className="text-xl sm:text-2xl text-white/80 mt-4 font-medium">
              Página não encontrada
            </p>
            <p className="text-white/60 mt-2 text-base max-w-md mx-auto">
              O endereço que você acessou não existe ou foi removido.
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-full bg-white text-primary font-semibold hover:bg-white/90 transition-colors"
            >
              Voltar para a calculadora
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
