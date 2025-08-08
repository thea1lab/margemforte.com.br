import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button-variants'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Leaf } from 'lucide-react'
import logo from '@/assets/logo.png'
import { useSearchParams } from 'react-router-dom'

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

export const AuthForm = () => {
  const { signIn, signUp } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(
    tabParam === 'signup' ? 'signup' : 'signin'
  )

  useEffect(() => {
    const urlTab = tabParam === 'signup' ? 'signup' : 'signin'
    setActiveTab(urlTab)
  }, [tabParam])

  // Sign in form state
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  })

  // Sign up form state
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    full_name: '',
    crea_license: '',
    state: ''
  })

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await signIn(signInData.email, signInData.password)

      if (error) {
        toast({
          title: "Erro no login",
          description: error.message,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo ao Margem Forte!",
          variant: "default"
        })
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (signUpData.password.length < 8) {
      toast({
        title: "Senha muito fraca",
        description: "A senha deve ter pelo menos 8 caracteres",
        variant: "destructive"
      })
      setLoading(false)
      return
    }

    try {
      const { error } = await signUp(signUpData.email, signUpData.password, {
        full_name: signUpData.full_name,
        crea_license: signUpData.crea_license || undefined,
        state: signUpData.state || undefined
      })

      if (error) {
        toast({
          title: "Erro no cadastro",
          description: error.message,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Cadastro realizado!",
          description: "Verifique seu email para confirmar a conta. Teste grátis por 15 dias!",
          variant: "default"
        })
        setActiveTab('signin')
        const newParams = new URLSearchParams(searchParams)
        newParams.set('tab', 'signin')
        setSearchParams(newParams)
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-field flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src={logo} alt="Margem Forte" className="w-16 h-16" />
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">Margem Forte</h1>
          <p className="text-muted-foreground">Calculadora profissional de margem para consultores agrícolas e profissionais de vendas</p>
        </div>

        <Card className="shadow-strong">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-primary">
              {activeTab === 'signin' ? 'Acesse sua conta' : 'Crie sua conta'}
            </CardTitle>
            <CardDescription>
              {activeTab === 'signin'
                ? 'Entre com suas credenciais para continuar'
                : 'Comece seu teste grátis de 15 dias'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={(value) => {
                const newTab = value as 'signin' | 'signup'
                setActiveTab(newTab)
                const newParams = new URLSearchParams(searchParams)
                newParams.set('tab', newTab)
                setSearchParams(newParams)
              }}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Cadastrar</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={signInData.email}
                      onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Senha</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={signInData.password}
                      onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="agricultural"
                    size="lg"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Entrar
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nome completo</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Seu nome completo"
                      value={signUpData.full_name}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, full_name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                    <p className="text-xs text-muted-foreground">Mínimo 8 caracteres</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-crea">CREA (opcional)</Label>
                      <Input
                        id="signup-crea"
                        type="text"
                        placeholder="CREA-XX XXXXX"
                        value={signUpData.crea_license}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, crea_license: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-state">Estado</Label>
                      <Select value={signUpData.state} onValueChange={(value) => setSignUpData(prev => ({ ...prev, state: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {BRAZILIAN_STATES.map(state => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    variant="agricultural"
                    size="lg"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Leaf className="mr-2 h-4 w-4" />
                    Começar teste grátis
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    15 dias grátis • Sem cartão de crédito • $99/ano após teste
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}