import { supabase } from './supabase'

export async function getCurrentTenantId(): Promise<string> {
  // 1. Récupération de la session utilisateur connectée
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Vérifier si le tenant existe déjà pour cet email/id
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('email', user.email)
      .maybeSingle()

    if (tenant?.id) return tenant.id

    // S'il n'existe pas encore, on le crée dynamiquement
    const { data: newTenant } = await supabase
      .from('tenants')
      .insert([{ id: user.id, email: user.email, statut_abonnement: 'actif' }])
      .select('id')
      .single()

    if (newTenant?.id) return newTenant.id
  }

  // 2. Fallback tenant par défaut (pour les sessions invitées ou tests)
  const { data: defaultTenant } = await supabase
    .from('tenants')
    .select('id')
    .limit(1)
    .single()

  return defaultTenant?.id || 'bc2b1445-38c9-4470-b8a1-cdc9f59284ff'
}