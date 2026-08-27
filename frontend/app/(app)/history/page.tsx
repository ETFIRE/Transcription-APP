'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Clock, CheckSquare, Loader2 } from 'lucide-react'

interface MeetingItem {
  id: string
  title: string
  summary?: string
  created_at: string
  duration?: number
  themes?: string[]
  actions_count?: number
}

export default function HistoryPage() {
  const [meetings, setMeetings] = useState<MeetingItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      try {
        const userEmail =
          typeof window !== 'undefined'
            ? localStorage.getItem('scribe_email') || localStorage.getItem('email')
            : null

        if (!userEmail) {
          setLoading(false)
          return
        }

        const cleanEmail = userEmail.trim().toLowerCase()

        // 1. Récupérer le tenant_id
        const { data: tenant } = await supabase
          .from('tenants')
          .select('id')
          .ilike('email', cleanEmail)
          .maybeSingle()

        if (!tenant) {
          setLoading(false)
          return
        }

        // 2. Récupérer les réunions depuis la table meetings
        const { data: rawMeetings, error } = await supabase
          .from('meetings')
          .select('*')
          .eq('tenant_id', tenant.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Erreur Supabase meetings :', error)
          // Fallback au cas où le champ s'appelle user_id
          const { data: fallbackMeetings } = await supabase
            .from('meetings')
            .select('*')
            .order('created_at', { ascending: false })

          if (fallbackMeetings) {
            setMeetings(formatMeetings(fallbackMeetings))
          }
          setLoading(false)
          return
        }

        if (rawMeetings) {
          setMeetings(formatMeetings(rawMeetings))
        }
      } catch (err) {
        console.error('Exception chargement historique :', err)
      } finally {
        setLoading(false)
      }
    }

    function formatMeetings(list: any[]): MeetingItem[] {
      return list.map((m) => {
        // Parsing des actions / décisions
        let actionsCount = 0
        if (Array.isArray(m.actions)) actionsCount = m.actions.length
        else if (Array.isArray(m.decisions)) actionsCount = m.decisions.length
        else if (typeof m.actions === 'number') actionsCount = m.actions

        // Parsing des tags / thèmes
        const themes = Array.isArray(m.themes)
          ? m.themes
          : Array.isArray(m.tags)
          ? m.tags
          : []

        return {
          id: m.id,
          title: m.title || m.titre || 'Réunion sans titre',
          summary: m.summary || m.resume || 'Aucun résumé disponible.',
          created_at: m.created_at || m.cree_le || new Date().toISOString(),
          duration: m.duration || m.duree_secondes || 0,
          themes,
          actions_count: actionsCount,
        }
      })
    }

    fetchHistory()
  }, [])

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
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-8">
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
                  {formatDate(meeting.created_at)}
                </div>
                <h3 className="text-lg font-bold text-card-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {meeting.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  {meeting.summary}
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
                  {formatDuration(meeting.duration)}
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckSquare className="h-3.5 w-3.5" />
                  {meeting.actions_count} open action{meeting.actions_count && meeting.actions_count > 1 ? 's' : ''}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}