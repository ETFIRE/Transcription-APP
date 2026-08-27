import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(`${origin}/signin?error=token_manquant`)
  }

  // Vérifier et valider le compte
  const { data, error } = await supabase
    .from('tenants')
    .update({
      email_verifie: true,
      token_verification: null,
    })
    .eq('token_verification', token)
    .select()

  if (error || !data || data.length === 0) {
    return NextResponse.redirect(`${origin}/signin?error=lien_invalide_ou_expire`)
  }

  return NextResponse.redirect(`${origin}/signin?verified=true`)
}