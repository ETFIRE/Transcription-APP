'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Calendar, Clock, Video, CheckSquare } from 'lucide-react'

export default function HistoryPage() {
  const [loading, setLoading] = useState(true)
  const [meetings, setMeetings] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    async function fetchHistory() {
      try {
        const userEmail = typeof window !== 'undefined' ? localStorage.getItem('scribe_email') : null

        if (!userEmail) {
          router.push('/signin')
          return
        }

        // 1. Récupérer le tenant_id de l'utilisateur connecté
        const { data: tenant, error: tenantError } = await supabase
          .from('tenants')
          .select('id')
          .eq('email', userEmail)
          .single()

        if (tenantError || !tenant) {
          setLoading(false)
          return
        }

        // 2. Récupérer uniquement les réunions liées à ce tenant_id
        const { data, error } = await supabase
          .from('reunions')
          .select(`
            *,
            analyses_reunion (
              resume,
              ton,
              themes,
              actions
            )
          `)
          .eq('tenant_id', tenant.id)
          .order('cree_le', { ascending: false })

        if (error) throw error
        setMeetings(data || [])
      } catch (err) {
        console.error("Erreur chargement historique:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [router])

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const parseJsonArray = (val: any) => {
    if (!val) return []
    if (Array.isArray(val)) return val
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val)
        return Array.isArray(parsed) ? parsed : []
      } catch { return [] }
    }
    return []
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">History</h1>
        <p className="text-muted-foreground">{meetings.length} meetings recorded</p>
      </div>

      {meetings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Aucune réunion enregistrée</p>
            <p className="text-sm text-muted-foreground">Vos futurs comptes rendus apparaîtront ici.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {meetings.map((m) => {
            const analysis = Array.isArray(m.analyses_reunion) ? m.analyses_reunion[0] : m.analyses_reunion
            const themes = parseJsonArray(analysis?.themes)
            const actions = parseJsonArray(analysis?.actions)
            const openActionsCount = actions.filter((a: any) => a?.status !== 'done').length
            const dateFormatted = m.cree_le ? new Date(m.cree_le).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Date inconnue'

            return (
              <Card key={m.id} className="flex flex-col justify-between">
                <CardHeader className="space-y-1">
                  <p className="text-xs text-muted-foreground">{dateFormatted}</p>
                  <CardTitle className="text-lg font-semibold truncate">{m.titre || 'Sans titre'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {analysis?.resume || 'Traitement IA en cours ou aucune synthèse générée...'}
                  </p>

                  {themes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {themes.slice(0, 3).map((t: string, idx: number) => (
                        <span key={idx} className="text-xs bg-secondary px-2 py-0.5 rounded-md text-secondary-foreground">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {Math.round((m.duree_secondes || 0) / 60)} min
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckSquare className="h-3.5 w-3.5" />
                      {openActionsCount} open actions
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}