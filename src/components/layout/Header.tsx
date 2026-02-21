import {
  History,
  HelpCircle,
  Menu,
  Calculator,
  TrendingUp,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  { path: "/", label: "Calculadora", icon: Calculator },
  { path: "/historico", label: "Histórico", icon: History },
  { path: "/faq", label: "FAQ", icon: HelpCircle },
];

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50">
      {/* Glass background */}
      <div className="bg-white/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <div
              className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0"
              onClick={() => navigate("/")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") navigate("/");
              }}
              role="link"
              tabIndex={0}
              aria-label="Ir para a página inicial"
            >
              <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-[hsl(235,55%,38%)] to-[hsl(255,50%,50%)] flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
                <TrendingUp className="h-4 w-4 text-white" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
              </div>
              <h1 className="text-lg font-bold tracking-tight hidden min-[400px]:block">
                <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Margem
                </span>
                <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                  {" "}
                  Forte
                </span>
              </h1>
            </div>

            {/* Center: Floating pill nav (desktop) */}
            <nav className="hidden sm:flex items-center">
              <div className="flex items-center gap-0.5 bg-secondary/80 rounded-full p-1 shadow-sm border border-border/40">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => navigate(item.path)}
                      className={`
                        relative flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium
                        transition-all duration-200 whitespace-nowrap
                        ${
                          active
                            ? "bg-white text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }
                      `}
                      aria-label={`Ir para ${item.label}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Right: spacer for balance on desktop, mobile menu on mobile */}
            <div className="w-9 shrink-0 hidden sm:block" />
            <div className="sm:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <button
                    className="h-9 w-9 rounded-xl bg-secondary/80 border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    aria-label="Abrir menu"
                  >
                    <Menu className="h-4.5 w-4.5" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:max-w-sm">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[hsl(235,55%,38%)] to-[hsl(255,50%,50%)] flex items-center justify-center">
                        <TrendingUp className="h-3.5 w-3.5 text-white" />
                      </div>
                      <span className="font-bold tracking-tight">
                        <span className="text-foreground">Margem</span>
                        <span className="text-primary"> Forte</span>
                      </span>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-8 flex flex-col gap-1">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);
                      return (
                        <button
                          key={item.path}
                          type="button"
                          onClick={() => navigate(item.path)}
                          className={`
                            flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium
                            transition-all duration-150
                            ${
                              active
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                            }
                          `}
                        >
                          <Icon
                            className={`h-5 w-5 ${active ? "text-primary" : ""}`}
                          />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
      {/* Bottom gradient accent */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </header>
  );
};
