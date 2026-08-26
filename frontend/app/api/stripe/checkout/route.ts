import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

// Initialisation sécurisée pour éviter le crash lors du build Vercel
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_build', {
  apiVersion: '2024-06-20',
})

export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'STRIPE_SECRET_KEY manquante dans les variables d’environnement.' },
        { status: 500 }
      )
    }

    const { tenantId, priceId } = await req.json()

    if (!tenantId || !priceId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.headers.get('origin') || 'http://localhost:3000'

    // Création de la session de paiement Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      // Redirection après paiement
      success_url: `${appUrl}/dashboard?success=true`,
      cancel_url: `${appUrl}/dashboard?canceled=true`,
      // Métadonnées pour le webhook n8n
      metadata: { tenant_id: tenantId },
      subscription_data: { metadata: { tenant_id: tenantId } },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}