'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Video, Mic, Clock, CheckSquare, ArrowUpRight } from 'lucide-react'

export default function HistoryPage() {
  const [meetings, setMeetings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      try {
        // On récupère les réunions et on joint la table des analyses
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
          .order('cree_le', { ascending: false })

        if (error) throw error
        setMeetings(data || [])
      } catch (error) {
        console.error("Erreur lors de la récupération de l'historique:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  // Fonction sécurisée pour lire les listes JSON (actions, thèmes)
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

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">History</h1>
        <p className="text-muted-foreground">{meetings.length} meetings</p>
      </div>

      {meetings.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border text-muted-foreground">
          Aucune réunion enregistrée pour le moment.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {meetings.map((meeting) => {
            // Supabase renvoie un tableau pour les jointures, on prend le premier élément
            const analysis = Array.isArray(meeting.analyses_reunion) 
              ? meeting.analyses_reunion[0] 
              : meeting.analyses_reunion
              
            const actions = parseJsonArray(analysis?.actions)
            const themes = parseJsonArray(analysis?.themes)
            const openActions = actions.filter((a: any) => a?.status !== 'done').length

            return (
              <Link href={`/meetings/${meeting.id}`} key={meeting.id}>
                <Card className="group relative flex h-full cursor-pointer flex-col transition-colors hover:border-primary/50 hover:bg-muted/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          {new Date(meeting.cree_le).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        <h3 className="font-semibold leading-none tracking-tight line-clamp-1">
                          {meeting.titre || 'Réunion sans titre'}
                        </h3>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex flex-1 flex-col justify-between gap-4">
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {analysis?.resume || 'Traitement IA en cours ou aucune synthèse générée...'}
                    </p>

                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {analysis?.ton && (
                          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 capitalize">
                            {analysis.ton}
                          </Badge>
                        )}
                        {themes.slice(0, 2).map((theme: string, i: number) => (
                          <Badge key={i} variant="outline" className="bg-background capitalize">
                            {theme}
                          </Badge>
                        ))}
                        <Badge variant="outline" className="gap-1 bg-background">
                          {meeting.type_mode === 'visio' ? <Video className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                          {meeting.type_mode === 'visio' ? 'Visio' : 'Dictaphone'}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 border-t border-border/50 pt-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {meeting.duree_secondes ? Math.round(meeting.duree_secondes / 60) : 0}m
                        </span>
                        <span className="flex items-center gap-1.5">
                          <CheckSquare className="h-3.5 w-3.5" />
                          {openActions} open
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}