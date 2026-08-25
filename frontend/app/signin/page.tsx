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
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)

    try {
      // 1. Vérifie si le tenant existe déjà dans Supabase
      let { data: tenant, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('email', email)
        .single()

      // 2. Si le tenant n'existe pas, on le crée automatiquement
      if (!tenant) {
        const { data: newTenant, error: insertError } = await supabase
          .from('tenants')
          .insert([{ email, statut_abonnement: 'inactive' }])
          .select()
          .single()

        if (insertError) throw insertError
        tenant = newTenant
      }

      // 3. Stocke l'e-mail actif dans le navigateur
      localStorage.setItem('scribe_email', tenant.email)

      // 4. Redirige vers le dashboard
      router.push('/dashboard')
    } catch (err) {
      console.error('Erreur de connexion:', err)
      alert('Impossible de se connecter. Vérifie ta console.')
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
          <CardTitle className="text-2xl">Sign in to Scribe</CardTitle>
          <CardDescription>Enter your email address to access your workspace</CardDescription>
        </CardHeader>
        <form onSubmit={handleSignIn}>
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
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Connecting...' : 'Continue with Email'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}