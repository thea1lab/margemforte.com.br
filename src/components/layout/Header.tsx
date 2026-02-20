import { Button } from '@/components/ui/button-variants'
import { History, HelpCircle, Menu, Calculator } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

export const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Brand */}
          <div className="flex items-center gap-8">
            <div
              className="flex items-center gap-2.5 cursor-pointer select-none group"
              onClick={() => navigate('/')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/') }}
              role="link"
              tabIndex={0}
              aria-label="Ir para a página inicial"
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[hsl(235,55%,38%)] to-[hsl(255,50%,50%)] flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <Calculator className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">
                <span className="text-foreground">Margem</span>
                <span className="text-primary"> Forte</span>
              </h1>
            </div>

            {/* Desktop nav */}
            <nav className="hidden sm:flex items-center gap-1">
              <Button
                variant="ghost"
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive('/historico')
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
                onClick={() => navigate('/historico')}
                aria-label="Ir para o Histórico"
              >
                <History className="h-4 w-4" />
                Histórico
              </Button>
              <Button
                variant="ghost"
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive('/faq')
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
                onClick={() => navigate('/faq')}
                aria-label="Ir para o FAQ"
              >
                <HelpCircle className="h-4 w-4" />
                FAQ
              </Button>
            </nav>
          </div>

          {/* Right: Mobile Menu */}
          <div className="sm:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" aria-label="Abrir menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-sm">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-[hsl(235,55%,38%)] to-[hsl(255,50%,50%)] flex items-center justify-center">
                      <Calculator className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-foreground">Margem</span>
                    <span className="text-primary">Forte</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    className={`justify-start gap-3 px-4 py-3 rounded-xl text-base ${
                      isActive('/') ? 'bg-secondary text-foreground' : ''
                    }`}
                    onClick={() => navigate('/')}
                  >
                    <Calculator className="h-5 w-5" /> Calculadora
                  </Button>
                  <Button
                    variant="ghost"
                    className={`justify-start gap-3 px-4 py-3 rounded-xl text-base ${
                      isActive('/historico') ? 'bg-secondary text-foreground' : ''
                    }`}
                    onClick={() => navigate('/historico')}
                  >
                    <History className="h-5 w-5" /> Histórico
                  </Button>
                  <Button
                    variant="ghost"
                    className={`justify-start gap-3 px-4 py-3 rounded-xl text-base ${
                      isActive('/faq') ? 'bg-secondary text-foreground' : ''
                    }`}
                    onClick={() => navigate('/faq')}
                  >
                    <HelpCircle className="h-5 w-5" /> FAQ
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
