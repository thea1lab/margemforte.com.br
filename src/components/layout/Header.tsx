import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button-variants'
import { LogOut, History, HelpCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const Header = () => {
  const { user, signOut, trialDaysLeft, isTrialActive } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          
          {/* Left side: Logo + History Button */}
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

          {/* Right: User Info */}
          <div className="flex items-center space-x-4">
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
          
        </div>
      </div>
    </header>
  )
}