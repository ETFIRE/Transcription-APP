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
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setInfoMessage(null)

    const cleanEmail = email.trim().toLowerCase()

    try {
      // 1. Vérifier si l'e-mail existe déjà en base
      const { data: existingTenant, error: fetchError } = await supabase
        .from('tenants')
        .select('*')
        .ilike('email', cleanEmail)
        .maybeSingle()

      if (fetchError) throw fetchError

      if (isSignUp) {
        // --- MODE INSCRIPTION (Point 2) ---
        if (existingTenant) {
          alert("Cet e-mail est déjà utilisé. Veuillez vous connecter.")
          setIsSignUp(false)
          setLoading(false)
          return
        }

        // Générer un token unique côté navigateur
        const verificationToken = crypto.randomUUID()

        // Créer le compte en attente de validation
        const { error: insertError } = await supabase
          .from('tenants')
          .insert([
            {
              email: cleanEmail,
              password,
              statut_abonnement: 'inactive',
              email_verifie: false,
              token_verification: verificationToken,
            },
          ])

        if (insertError) throw insertError

        // TODO: Déclencher l'envoi de l'e-mail avec le lien contenant verificationToken
        // ex: https://ton-site.vercel.app/api/auth/verify?token=${verificationToken}

        setInfoMessage("Compte créé ! Un e-mail de confirmation vous a été envoyé. Veuillez cliquer sur le lien avant de vous connecter.")
        setIsSignUp(false)
      } else {
        // --- MODE CONNEXION (Point 4) ---
        if (!existingTenant) {
          alert("Aucun compte trouvé avec cet e-mail. Veuillez vous inscrire.")
          setIsSignUp(true)
          setLoading(false)
          return
        }

        // Vérifier le mot de passe
        if (existingTenant.password && existingTenant.password !== password) {
          alert("Mot de passe incorrect.")
          setLoading(false)
          return
        }

        // Bloquer la connexion si l'e-mail n'est pas encore confirmé
        if (existingTenant.email_verifie === false) {
          alert("Votre adresse e-mail n'est pas encore vérifiée. Veuillez cliquer sur le lien reçu par e-mail.")
          setLoading(false)
          return
        }

        // Si le compte n'avait pas encore de mot de passe en BDD, on l'ajoute
        if (!existingTenant.password) {
          await supabase
            .from('tenants')
            .update({ password })
            .ilike('email', cleanEmail)
        }

        localStorage.setItem('scribe_email', existingTenant.email)
        router.push('/dashboard')
      }
    } catch (err: any) {
      console.error('Erreur authentification:', err)
      alert(err.message || 'Une erreur est survenue. Vérifiez la console.')
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
            {infoMessage && (
              <div className="p-3 text-sm rounded bg-blue-50 text-blue-800 border border-blue-200">
                {infoMessage}
              </div>
            )}
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
              {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setInfoMessage(null)
              }}
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