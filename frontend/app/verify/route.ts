import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(`${origin}/signin?error=token_manquant`);
  }

  // 1. Mise à jour du statut dans la table tenants
  const { error } = await supabase
    .from('tenants')
    .update({ email_verifie: true })
    .eq('token_verification', token);

  if (error) {
    console.error('Erreur validation Supabase :', error);
    return NextResponse.redirect(`${origin}/signin?error=echec_validation`);
  }

  // 2. Redirection vers la page de connexion
  return NextResponse.redirect(`${origin}/signin?verified=true`);
}