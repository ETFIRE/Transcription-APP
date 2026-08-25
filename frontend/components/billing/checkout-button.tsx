'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, CreditCard } from 'lucide-react'
import { getCurrentTenantId } from '@/lib/get-tenant' // Ta fonction pour récupérer l'ID utilisateur

export function CheckoutButton() {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const tenantId = await getCurrentTenantId()
      
      // Remplace par TON vrai Price ID Stripe
      const priceId = 'price_1234567890abcdef' 

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
    } catch (error) {
      console.error(error)
      alert("Impossible de lancer le paiement.")
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