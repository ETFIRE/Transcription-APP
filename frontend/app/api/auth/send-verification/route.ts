import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { email, token } = await req.json()

    if (!email || !token) {
      return NextResponse.json({ error: 'Paramètres manquants.' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.headers.get('origin') || 'http://localhost:3000'
    const verifyUrl = `${appUrl}/api/auth/verify?token=${token}`

    const { data, error } = await resend.emails.send({
      from: 'Scribe <onboarding@resend.dev>',
      to: [email],
      subject: 'Confirmez votre adresse e-mail — Scribe',
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 8px;">
          <h2 style="color: #111; margin-bottom: 16px;">Bienvenue sur Scribe</h2>
          <p style="color: #444; line-height: 1.5;">Merci de finaliser votre inscription en confirmant votre adresse e-mail :</p>
          <div style="margin: 28px 0;">
            <a href="${verifyUrl}" style="background-color: #000; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
              Confirmer mon compte
            </a>
          </div>
          <p style="color: #888; font-size: 13px; word-break: break-all;">
            Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br/>
            <a href="${verifyUrl}" style="color: #555;">${verifyUrl}</a>
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('Erreur API Resend :', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error('Exception lors de l’envoi de l’e-mail :', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}