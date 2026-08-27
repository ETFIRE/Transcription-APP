'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, CreditCard } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function CheckoutButton() {
  const [loading, setLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null)

  useEffect(() => {
    async function checkSubscription() {
      try {
        const userEmail =
          typeof window !== 'undefined'
            ? localStorage.getItem('scribe_email') || localStorage.getItem('email')
            : null

        if (!userEmail) {
          console.warn('[Billing] Aucun email trouvé dans le localStorage.')
          setIsSubscribed(false)
          return
        }

        const cleanEmail = userEmail.trim().toLowerCase()

        const { data: tenant, error } = await supabase
          .from('tenants')
          .select('id, statut_abonnement')
          .ilike('email', cleanEmail)
          .maybeSingle()

        if (error) {
          console.error('[Billing] Erreur Supabase :', error)
          setIsSubscribed(false)
          return
        }

        console.log('[Billing] Profil trouvé :', tenant)

        const active = tenant?.statut_abonnement === 'active'
        setIsSubscribed(active)
      } catch (err) {
        console.error('[Billing] Exception :', err)
        setIsSubscribed(false)
      }
    }

    checkSubscription()
  }, [])

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const userEmail =
        typeof window !== 'undefined'
          ? localStorage.getItem('scribe_email') || localStorage.getItem('email')
          : null

      if (!userEmail) {
        throw new Error('Aucun e-mail trouvé dans la session. Veuillez vous reconnecter.')
      }

      const cleanEmail = userEmail.trim().toLowerCase()

      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('id')
        .ilike('email', cleanEmail)
        .maybeSingle()

      if (tenantError || !tenant) {
        throw new Error(`Aucun profil trouvé en base pour l'e-mail : ${cleanEmail}`)
      }

      const tenantId = tenant.id
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

  // Masquer le bouton tant qu'on vérifie ou si l'abonnement est actif
  if (isSubscribed === null || isSubscribed) {
    return null
  }

  return (
    <Button onClick={handleCheckout} disabled={loading} size="lg" className="w-full max-w-sm gap-2">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
      {loading ? 'Redirection sécurisée...' : 'Passer à Scribe Pro (15€/mois)'}
    </Button>
  )
}