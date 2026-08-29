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
  Video,
  Mic,
  Calendar,
} from 'lucide-react'

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

        let query = supabase
          .from('reunions')
          .select('*')
          .order('cree_le', { ascending: false })

        // Si l'utilisateur a un compte identifié, on filtre par son tenant_id
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
    const title = (m.titre || '').toLowerCase()
    const query = searchQuery.toLowerCase()

    // Recherche dans le titre
    if (title.includes(query)) return true

    // Recherche dans le compte-rendu ou les tags
    const cr = m.compte_rendu || {}
    const summary = typeof cr === 'string' ? cr : cr.resume || ''
    const tags = Array.isArray(cr.tags) ? cr.tags.join(' ') : ''

    return summary.toLowerCase().includes(query) || tags.toLowerCase().includes(query)
  })

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10 space-y-6">
      {/* En-tête */}
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

      {/* Barre de recherche */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par titre, tag, mot-clé..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-card"
        />
      </div>

      {/* État de chargement */}
      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredMeetings.length === 0 ? (
        /* État vide */
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
        /* Grille des réunions */
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMeetings.map((m) => {
            const formattedDate = m.cree_le
              ? new Intl.DateTimeFormat('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                }).format(new Date(m.cree_le))
              : '29 août 2026'

            const cr = m.compte_rendu || {}
            const summaryText =
              typeof cr === 'string'
                ? cr
                : cr.resume || cr.summary || m.transcription || "En attente de génération du compte-rendu..."

            const tags: string[] = Array.isArray(cr.tags) ? cr.tags : []
            const actions: any[] = Array.isArray(cr.actions) ? cr.actions : Array.isArray(cr.action_items) ? cr.action_items : []

            return (
              <Link key={m.id} href={`/meetings/${m.id}`} className="group block">
                <Card className="h-full flex flex-col justify-between transition-all hover:border-brand hover:shadow-md">
                  <CardContent className="p-6 space-y-4 flex-1">
                    {/* Date */}
                    <p className="text-xs font-medium text-muted-foreground">{formattedDate}</p>

                    {/* Titre */}
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {m.titre || 'Sans titre'}
                    </h3>

                    {/* Résumé extrait */}
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {summaryText}
                    </p>

                    {/* Tags */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {tags.slice(0, 5).map((t, idx) => (
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

                  {/* Bas de carte : Durée, Actions, et badge Audio */}
                  <div className="border-t border-border/50 px-6 py-3.5 flex items-center justify-between text-xs text-muted-foreground bg-secondary/10 rounded-b-xl">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {m.duree || 0} min
                      </span>
                      {actions.length > 0 && (
                        <span className="flex items-center gap-1">
                          <CheckSquare className="h-3.5 w-3.5" /> {actions.length} open action{actions.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {/* Indicateur Audio Original */}
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