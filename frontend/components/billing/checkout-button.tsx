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
      // 1. Récupérer l'e-mail actif depuis le localStorage (comme le Dashboard et l'History)
      const userEmail = typeof window !== 'undefined' ? localStorage.getItem('scribe_email') : null

      if (!userEmail) {
        throw new Error("Aucun e-mail trouvé dans la session. Veuillez vous reconnecter.")
      }

      const cleanEmail = userEmail.trim()

      // 2. Interroger Supabase pour obtenir le VRAI tenant_id correspondant à cet e-mail exact
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('id')
        .eq('email', cleanEmail)
        .maybeSingle()

      if (tenantError || !tenant) {
        throw new Error(`Aucun profil trouvé en base pour l'e-mail : ${cleanEmail}`)
      }

      const tenantId = tenant.id
      
      // Ton vrai Price ID Stripe
      const priceId = 'price_1U8FN5GbUbRdrr9C4v3UnCny' 

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, priceId }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Erreur lors de la création de la session Stripe')
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