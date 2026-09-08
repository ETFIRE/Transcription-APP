import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, token } = await request.json();

    if (!email || !token) {
      return NextResponse.json(
        { error: 'Email et token sont obligatoires' },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://transcription-14rnqy59m-on-fire2.vercel.app';
    const verifyUrl = `${appUrl}/verify?token=${token}`;

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY || '',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'Transcription App',
          email: process.env.BREVO_SENDER_EMAIL || 'elietoure123@gmail.com',
        },
        to: [{ email }],
        subject: 'Confirmez votre compte - Transcription App',
        htmlContent: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Confirmation de votre compte</h2>
            <p>Merci pour votre inscription. Cliquez sur le lien ci-dessous pour activer votre accès :</p>
            <p style="margin: 25px 0;">
              <a href="${verifyUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Vérifier mon adresse email
              </a>
            </p>
            <p style="color: #666; font-size: 13px;">Si le bouton ne fonctionne pas, copiez ce lien :<br>${verifyUrl}</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur API Brevo :', errorData);
      return NextResponse.json({ error: errorData }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ success: true, messageId: data.messageId });
  } catch (error) {
    console.error('Erreur serveur send-verification :', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}