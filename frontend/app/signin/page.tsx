'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ScribeLogo } from '@/components/scribe-logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Détection des retours de vérification via l'URL (?verified=true ou ?error=...)
  useEffect(() => {
    const verified = searchParams.get('verified')
    const error = searchParams.get('error')

    if (verified === 'true') {
      setMessage({
        type: 'success',
        text: 'Votre adresse e-mail a été confirmée avec succès ! Vous pouvez vous connecter.',
      })
    } else if (error) {
      setMessage({
        type: 'error',
        text:
          error === 'token_manquant'
            ? 'Lien de confirmation invalide (token manquant).'
            : error === 'lien_invalide_ou_expire'
            ? 'Ce lien de confirmation est invalide ou a expiré.'
            : 'Une erreur est survenue lors de la vérification.',
      })
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setMessage(null)

    const cleanEmail = email.trim().toLowerCase()

    try {
      // 1. Vérification de l'existence du compte en base
      const { data: existingTenant, error: fetchError } = await supabase
        .from('tenants')
        .select('*')
        .ilike('email', cleanEmail)
        .maybeSingle()

      if (fetchError) throw fetchError

      if (isSignUp) {
        // --- MODE INSCRIPTION ---
        if (existingTenant) {
          setMessage({
            type: 'error',
            text: 'Cet e-mail est déjà utilisé. Veuillez vous connecter.',
          })
          setIsSignUp(false)
          setLoading(false)
          return
        }

        const verificationToken = crypto.randomUUID()

        // Création de l'entrée dans Supabase
        const { error: insertError } = await supabase.from('tenants').insert([
          {
            email: cleanEmail,
            password,
            statut_abonnement: 'inactive',
            email_verifie: false,
            token_verification: verificationToken,
          },
        ])

        if (insertError) throw insertError

        // Déclenchement de l'envoi de l'e-mail via Resend
        const res = await fetch('/api/auth/send-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, token: verificationToken }),
        })

        if (!res.ok) {
          const errData = await res.json()
          console.error('Erreur API Resend :', errData)
        }

        setMessage({
          type: 'info',
          text: 'Compte créé ! Un e-mail de confirmation vient de vous être envoyé. Cliquez sur le lien reçu avant de vous connecter.',
        })
        setIsSignUp(false)
      } else {
        // --- MODE CONNEXION ---
        if (!existingTenant) {
          setMessage({
            type: 'error',
            text: 'Aucun compte trouvé avec cet e-mail. Veuillez vous inscrire.',
          })
          setIsSignUp(true)
          setLoading(false)
          return
        }

        // Vérification du mot de passe
        if (existingTenant.password && existingTenant.password !== password) {
          setMessage({
            type: 'error',
            text: 'Mot de passe incorrect.',
          })
          setLoading(false)
          return
        }

        // Blocage si l'e-mail n'a pas été validé
        if (existingTenant.email_verifie === false) {
          setMessage({
            type: 'error',
            text: "Votre adresse e-mail n'est pas encore vérifiée. Veuillez cliquer sur le lien reçu dans votre boîte de réception.",
          })
          setLoading(false)
          return
        }

        // Sauvegarde du mot de passe s'il n'existait pas encore
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
      setMessage({
        type: 'error',
        text: err.message || 'Une erreur est survenue lors de la tentative.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
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
          {message && (
            <div
              className={`p-3 text-sm rounded-md border ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : message.type === 'error'
                  ? 'bg-red-50 text-red-800 border-red-200'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}
            >
              {message.text}
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
              setMessage(null)
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
  )
}

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Suspense fallback={<div className="text-sm text-muted-foreground">Chargement...</div>}>
        <SignInForm />
      </Suspense>
    </div>
  )
}