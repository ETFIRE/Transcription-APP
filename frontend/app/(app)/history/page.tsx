'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Loader2,
  Search,
  Volume2,
  Clock,
  CheckSquare,
  Plus,
  Calendar,
} from 'lucide-react'

function extractMeetingData(m: any) {
  if (!m) return { summary: '', themes: [], actions: [], durationMin: 0 }

  const analysis = Array.isArray(m.analyses_reunion)
    ? m.analyses_reunion[0]
    : m.analyses_reunion || null

  const summary = analysis?.resume || m.description || ''

  let themes: string[] = []
  if (Array.isArray(analysis?.themes)) {
    themes = analysis.themes.map((t: any) => (typeof t === 'string' ? t : t.nom || t.tag || JSON.stringify(t)))
  } else if (typeof analysis?.themes === 'string') {
    try {
      themes = JSON.parse(analysis.themes)
    } catch {
      themes = analysis.themes.split(/[,;\n]/).map((t: string) => t.trim()).filter(Boolean)
    }
  }

  let actions: any[] = []
  if (Array.isArray(analysis?.actions)) {
    actions = analysis.actions
  } else if (typeof analysis?.actions === 'string') {
    try {
      actions = JSON.parse(analysis.actions)
    } catch {
      actions = analysis.actions.split('\n').map((a: string) => a.trim()).filter(Boolean)
    }
  }

  const durationMin = m.duree_secondes ? Math.max(1, Math.round(m.duree_secondes / 60)) : 0

  return { summary, themes, actions, durationMin }
}

export default function HistoryPage() {
  const router = useRouter()
  const [meetings, setMeetings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function loadHistory() {
      try {
        const storedEmail =
          typeof window !== 'undefined'
            ? localStorage.getItem('scribe_email') || localStorage.getItem('email')
            : null

        // Requête avec jointure sur analyses_reunion
        let query = supabase
          .from('reunions')
          .select(`
            *,
            analyses_reunion (*)
          `)
          .order('cree_le', { ascending: false })

        if (storedEmail) {
          const { data: tenant } = await supabase
            .from('tenants')
            .select('id')
            .ilike('email', storedEmail.trim().toLowerCase())
            .maybeSingle()

          if (tenant?.id) {
            query = query.eq('tenant_id', tenant.id)
          }
        }

        const { data, error } = await query
        if (error) throw error
        setMeetings(data || [])
      } catch (err) {
        console.error('Erreur chargement historique :', err)
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [])

  const filteredMeetings = meetings.filter((m) => {
    const { summary, themes } = extractMeetingData(m)
    const title = (m.titre || '').toLowerCase()
    const query = searchQuery.toLowerCase()

    if (title.includes(query)) return true
    if (summary.toLowerCase().includes(query)) return true
    if (themes.join(' ').toLowerCase().includes(query)) return true

    return false
  })

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">History</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {meetings.length} meeting{meetings.length > 1 ? 's' : ''} recorded
          </p>
        </div>

        <Button onClick={() => router.push('/capture')} className="gap-2 self-start sm:self-auto">
          <Plus className="h-4 w-4" /> Nouvelle capture
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par titre, thème, mot-clé..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-card"
        />
      </div>

      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredMeetings.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground mb-3">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold">Aucune réunion trouvée</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            {searchQuery ? 'Aucun résultat ne correspond à votre recherche.' : 'Commencez à enregistrer une réunion pour voir vos résumés ici.'}
          </p>
          <Button onClick={() => router.push('/capture')} variant="outline">
            Lancer un enregistrement
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMeetings.map((m) => {
            const { summary, themes, actions, durationMin } = extractMeetingData(m)

            const formattedDate = m.cree_le
              ? new Intl.DateTimeFormat('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                }).format(new Date(m.cree_le))
              : 'Date inconnue'

            return (
              <Link key={m.id} href={`/meetings/${m.id}`} className="group block">
                <Card className="h-full flex flex-col justify-between transition-all hover:border-brand hover:shadow-md">
                  <CardContent className="p-6 space-y-4 flex-1">
                    <p className="text-xs font-medium text-muted-foreground">{formattedDate}</p>

                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {m.titre || 'Sans titre'}
                    </h3>

                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {summary || (
                        m.statut === 'en_attente' || m.statut === 'traitement'
                          ? 'Génération du compte-rendu en cours...'
                          : 'Aucun extrait disponible.'
                      )}
                    </p>

                    {themes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {themes.slice(0, 5).map((t, idx) => (
                          <span
                            key={idx}
                            className="rounded-full bg-secondary/80 px-2.5 py-0.5 text-xs text-muted-foreground font-medium"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>

                  <div className="border-t border-border/50 px-6 py-3.5 flex items-center justify-between text-xs text-muted-foreground bg-secondary/10 rounded-b-xl">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {durationMin} min
                      </span>
                      {actions.length > 0 && (
                        <span className="flex items-center gap-1">
                          <CheckSquare className="h-3.5 w-3.5" /> {actions.length} open action{actions.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {m.audio_url && (
                      <span className="flex items-center gap-1 text-primary font-medium bg-primary/10 px-2 py-0.5 rounded text-[11px]">
                        <Volume2 className="h-3 w-3" /> Audio
                      </span>
                    )}
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}