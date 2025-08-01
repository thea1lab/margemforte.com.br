import { useAuth } from '@/contexts/AuthContext'
import { AuthForm } from '@/components/auth/AuthForm'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

const Index = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-field flex items-center justify-center">
        <Card className="p-8">
          <CardContent className="flex items-center gap-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-lg">Carregando Margem Forte...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  return user ? <Dashboard /> : <AuthForm />
};

export default Index;
