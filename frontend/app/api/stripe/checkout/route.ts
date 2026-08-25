import { NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialisation de Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(req: Request) {
  try {
    const { tenantId, priceId } = await req.json()

    if (!tenantId || !priceId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    // Création de la session de paiement Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      // Redirection après paiement
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
      // Métadonnées vitales pour que notre Webhook n8n retrouve l'utilisateur
      metadata: { tenant_id: tenantId },
      subscription_data: { metadata: { tenant_id: tenantId } }
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("Stripe Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}