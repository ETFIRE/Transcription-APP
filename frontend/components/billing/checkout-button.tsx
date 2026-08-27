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
        const userEmail = typeof window !== 'undefined' ? localStorage.getItem('scribe_email') : null
        if (!userEmail) {
          setIsSubscribed(false)
          return
        }

        const cleanEmail = userEmail.trim()
        const { data: tenant } = await supabase
          .from('tenants')
          .select('statut_abonnement, plan')
          .eq('email', cleanEmail)
          .maybeSingle()

        // Vérifie si le statut est actif ou si le plan est "pro"
        const active = tenant?.statut_abonnement === 'active' || tenant?.plan === 'pro'
        setIsSubscribed(Boolean(active))
      } catch (error) {
        console.error('Erreur vérification abonnement :', error)
        setIsSubscribed(false)
      }
    }

    checkSubscription()
  }, [])

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const userEmail = typeof window !== 'undefined' ? localStorage.getItem('scribe_email') : null

      if (!userEmail) {
        throw new Error('Aucun e-mail trouvé dans la session. Veuillez vous reconnecter.')
      }

      const cleanEmail = userEmail.trim()

      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('id')
        .eq('email', cleanEmail)
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

  // Ne rien afficher pendant la vérification ou si l'utilisateur est déjà abonné
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