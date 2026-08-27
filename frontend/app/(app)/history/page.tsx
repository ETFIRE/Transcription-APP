'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Clock, CheckSquare, Loader2 } from 'lucide-react'

interface MeetingItem {
  id: string
  titre: string
  resume?: string
  cree_le: string
  duree_secondes?: number
  themes: string[]
  open_actions_count: number
}

export default function HistoryPage() {
  const [meetings, setMeetings] = useState<MeetingItem[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchHistory() {
      try {
        const userEmail =
          typeof window !== 'undefined'
            ? localStorage.getItem('scribe_email') || localStorage.getItem('email')
            : null

        if (!userEmail) {
          router.push('/signin')
          return
        }

        // 1. Récupérer le tenant_id de l'utilisateur connecté
        const { data: tenant, error: tenantError } = await supabase
          .from('tenants')
          .select('id')
          .eq('email', userEmail.trim().toLowerCase())
          .maybeSingle()

        if (tenantError || !tenant) {
          setLoading(false)
          return
        }

        // 2. Récupérer les réunions et leurs analyses
        const { data: rawMeetings, error: meetingsError } = await supabase
          .from('reunions')
          .select(`
            id,
            titre,
            duree_secondes,
            cree_le,
            analyses_reunion (
              resume,
              ton,
              themes,
              actions
            )
          `)
          .eq('tenant_id', tenant.id)
          .order('cree_le', { ascending: false })

        if (meetingsError) {
          console.error('Erreur chargement réunions :', meetingsError)
          setLoading(false)
          return
        }

        const parseJsonArray = (val: any) => {
          if (!val) return []
          if (Array.isArray(val)) return val
          if (typeof val === 'string') {
            try {
              const parsed = JSON.parse(val)
              return Array.isArray(parsed) ? parsed : []
            } catch {
              return []
            }
          }
          return []
        }

        const formatted = (rawMeetings || []).map((m: any) => {
          const analysis = Array.isArray(m.analyses_reunion)
            ? m.analyses_reunion[0]
            : m.analyses_reunion

          const actions = parseJsonArray(analysis?.actions)
          const openActions = actions.filter((a: any) => (a?.status || 'open') !== 'done').length

          const themes = parseJsonArray(analysis?.themes)

          return {
            id: m.id,
            titre: m.titre || 'Réunion sans titre',
            resume: analysis?.resume || 'Aucun résumé disponible pour cette réunion.',
            cree_le: m.cree_le,
            duree_secondes: m.duree_secondes || 0,
            themes: themes,
            open_actions_count: openActions,
          }
        })

        setMeetings(formatted)
      } catch (err) {
        console.error('Exception chargement historique :', err)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [router])

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const d = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d)
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0 min'
    const mins = Math.round(seconds / 60)
    return `${mins} min`
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">History</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {meetings.length} meeting{meetings.length > 1 ? 's' : ''} recorded
        </p>
      </div>

      {meetings.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          Aucun enregistrement trouvé. Lancez une nouvelle capture pour commencer.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetings.map((meeting) => (
            <Link
              key={meeting.id}
              href={`/meetings/${meeting.id}`}
              className="group block rounded-2xl border bg-card p-6 shadow-sm transition-all hover:border-foreground/30 hover:shadow-md cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="text-xs text-muted-foreground">
                  {formatDate(meeting.cree_le)}
                </div>
                <h3 className="text-lg font-bold text-card-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {meeting.titre}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  {meeting.resume}
                </p>

                {meeting.themes && meeting.themes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {meeting.themes.map((theme, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-secondary/80 px-2.5 py-0.5 text-xs text-secondary-foreground"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t pt-4 mt-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDuration(meeting.duree_secondes)}
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckSquare className="h-3.5 w-3.5" />
                  {meeting.open_actions_count} open action{meeting.open_actions_count > 1 ? 's' : ''}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}