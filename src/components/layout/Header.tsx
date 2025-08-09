import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button-variants'
import { LogOut, History, HelpCircle, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

export const Header = () => {
  const { user, signOut, trialDaysLeft, isTrialActive } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Brand */}
          <div className="flex items-center gap-6">
            <h1
              className="text-xl font-bold text-primary cursor-pointer select-none hover:opacity-90"
              onClick={() => navigate('/')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/') }}
              role="link"
              tabIndex={0}
              aria-label="Ir para a página inicial"
            >
              Margem Forte
            </h1>
            {/* Desktop nav */}
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-accent rounded-lg"
                onClick={() => navigate('/historico')}
                aria-label="Ir para o Histórico"
              >
                <History className="h-4 w-4" />
                Histórico
              </Button>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-accent rounded-lg"
                onClick={() => navigate('/faq')}
                aria-label="Ir para o FAQ"
              >
                <HelpCircle className="h-4 w-4" />
                FAQ
              </Button>
            </div>
          </div>

          {/* Right: User Info (desktop) + Mobile Menu */}
          <div className="flex items-center gap-2">
            {/* Desktop user info */}
            <div className="hidden sm:flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-foreground">
                  {user?.full_name}
                </div>
                {user?.subscription_status === 'trial' && (
                  <div className="text-xs text-warning">
                    Trial: {isTrialActive ? `${trialDaysLeft} dias restantes` : 'Expirado'}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-sm text-muted-foreground hover:text-destructive"
              >
                Sair
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="sm:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Abrir menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-sm">
                  <SheetHeader>
                    <SheetTitle className="text-primary">Menu</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 flex flex-col gap-2">
                    <Button
                      variant="ghost"
                      className="justify-start gap-2 px-3"
                      onClick={() => navigate('/historico')}
                    >
                      <History className="h-4 w-4" /> Histórico
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start gap-2 px-3"
                      onClick={() => navigate('/faq')}
                    >
                      <HelpCircle className="h-4 w-4" /> FAQ
                    </Button>
                    <div className="h-px bg-border my-2" />
                    {user && (
                      <div className="px-3 py-1 text-sm text-muted-foreground">
                        {user.full_name}
                        {user.subscription_status === 'trial' && (
                          <div className="text-xs text-warning">Trial: {isTrialActive ? `${trialDaysLeft} dias restantes` : 'Expirado'}</div>
                        )}
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      className="justify-start gap-2 px-3 text-destructive"
                      onClick={signOut}
                    >
                      <LogOut className="h-4 w-4" /> Sair
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}