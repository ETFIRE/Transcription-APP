'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ScribeLogo } from '@/components/scribe-logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false) // Bascule entre Inscription et Connexion
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)

    try {
      // 1. Vérifier si l'e-mail existe déjà en base
      const { data: existingTenant, error: fetchError } = await supabase
        .from('tenants')
        .select('*')
        .eq('email', email)
        .maybeSingle()

      if (isSignUp) {
        // --- MODE INSCRIPTION ---
        if (existingTenant) {
          alert("Cet e-mail est déjà utilisé. Veuillez vous connecter.")
          setIsSignUp(false) // Bascule automatique vers l'écran de connexion
          setLoading(false)
          return
        }

        // Créer le nouveau compte
        const { data: newTenant, error: insertError } = await supabase
          .from('tenants')
          .insert([{ email, password, statut_abonnement: 'inactive' }])
          .select()
          .single()

        if (insertError) throw insertError

        localStorage.setItem('scribe_email', newTenant.email)
        router.push('/dashboard')

      } else {
        // --- MODE CONNEXION ---
        if (!existingTenant) {
          alert("Aucun compte trouvé avec cet e-mail. Veuillez vous inscrire.")
          setIsSignUp(true) // Bascule automatique vers l'inscription
          setLoading(false)
          return
        }

        // Vérifier le mot de passe
        if (existingTenant.password && existingTenant.password !== password) {
          alert("Mot de passe incorrect.")
          setLoading(false)
          return
        }

        // Si le compte n'avait pas encore de mot de passe en BDD, on l'ajoute
        if (!existingTenant.password) {
          await supabase
            .from('tenants')
            .update({ password })
            .eq('email', email)
        }

        localStorage.setItem('scribe_email', existingTenant.email)
        router.push('/dashboard')
      }

    } catch (err) {
      console.error('Erreur authentification:', err)
      alert('Une erreur est survenue. Vérifiez la console.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <ScribeLogo />
          </div>
          <CardTitle className="text-2xl">
            {isSignUp ? 'Create an account' : 'Sign in to Scribe'}
          </CardTitle>
          <CardDescription>
            {isSignUp 
              ? 'Enter your details to create your workspace' 
              : 'Enter your email and password to access your workspace'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </Button>
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors text-center w-full"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"}
            </button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}