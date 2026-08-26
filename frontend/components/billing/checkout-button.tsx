'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, CreditCard } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function CheckoutButton() {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)
    try {
      // 1. Récupérer l'e-mail du compte connecté de façon fiable (localStorage avec fallback Auth)
      let userEmail = typeof window !== 'undefined' ? localStorage.getItem('scribe_email') : null

      if (!userEmail) {
        const { data: { user } } = await supabase.auth.getUser()
        userEmail = user?.email || null
      }

      if (!userEmail) {
        throw new Error("Aucun utilisateur connecté trouvé. Veuillez vous reconnecter.")
      }

      userEmail = userEmail.trim()

      // 2. Interroger Supabase pour obtenir le VRAI tenant_id de ce compte exact
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('id')
        .eq('email', userEmail)
        .maybeSingle()

      if (tenantError || !tenant) {
        throw new Error(`Impossible de trouver le tenant pour l'e-mail : ${userEmail}`)
      }

      const tenantId = tenant.id
      
      // Remplace par TON vrai Price ID Stripe
      const priceId = 'price_1U8FN5GbUbRdrr9C4v3UnCny' 

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, priceId }),
      })

      const data = await response.json()

      if (data.url) {
        // Redirection vers la page sécurisée de Stripe
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Erreur lors de la création de la session')
      }
    } catch (error: any) {
      console.error(error)
      alert(`Impossible de lancer le paiement : ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleCheckout} disabled={loading} size="lg" className="w-full max-w-sm gap-2">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
      {loading ? 'Redirection sécurisée...' : 'Passer à Scribe Pro (15€/mois)'}
    </Button>
  )
}