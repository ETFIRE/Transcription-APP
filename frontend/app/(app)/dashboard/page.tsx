'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Calendar, Clock, CheckSquare, Hammer } from 'lucide-react'
import { CheckoutButton } from '@/components/billing/checkout-button'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalMeetings: 0,
    totalHours: 0,
    openActions: 0,
    totalDecisions: 0,
    actionStatus: { open: 0, 'in-progress': 0, done: 0 },
    topThemes: [] as { name: string; count: number }[]
  })

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const { data: meetings, error } = await supabase
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

        if (error) throw error
        if (!meetings) return

        let seconds = 0
        let openActs = 0
        let decisions = 0
        const actionCounts = { open: 0, 'in-progress': 0, done: 0 }
        const themeMap: Record<string, number> = {}

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

        meetings.forEach((m) => {
          seconds += (m.duree_secondes || 0)
          const analysis = Array.isArray(m.analyses_reunion) ? m.analyses_reunion[0] : m.analyses_reunion

          // Traitement des actions
          const actions = parseJsonArray(analysis?.actions)
          actions.forEach((a: any) => {
            const status = a?.status || 'open'
            if (status !== 'done') openActs++
            if (status === 'done') actionCounts.done++
            else if (status === 'in-progress') actionCounts['in-progress']++
            else actionCounts.open++
          })

          // Traitement des thèmes/décisions
          const themes = parseJsonArray(analysis?.themes)
          decisions += themes.length
          themes.forEach((t: string) => {
            const cleanTheme = t.trim().toLowerCase()
            themeMap[cleanTheme] = (themeMap[cleanTheme] || 0) + 1
          })
        })

        // Trier les thèmes par fréquence
        const topThemes = Object.entries(themeMap)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)

        setStats({
          totalMeetings: meetings.length,
          totalHours: Number((seconds / 3600).toFixed(1)),
          openActions: openActs,
          totalDecisions: decisions,
          actionStatus: actionCounts,
          topThemes
        })

      } catch (err) {
        console.error("Erreur chargement dashboard:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const totalActions = stats.actionStatus.open + stats.actionStatus['in-progress'] + stats.actionStatus.done || 1 // Eviter division par zéro

  return (
    <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Your meeting intelligence at a glance.</p>
        </div>
        <CheckoutButton />
      </div>

      {/* Cartes de statistiques */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <Calendar className="mb-4 h-5 w-5 text-muted-foreground" />
            <div className="text-3xl font-bold">{stats.totalMeetings}</div>
            <p className="text-xs text-muted-foreground">Meetings captured</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Clock className="mb-4 h-5 w-5 text-muted-foreground" />
            <div className="text-3xl font-bold">{stats.totalHours}h</div>
            <p className="text-xs text-muted-foreground">Hours transcribed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <CheckSquare className="mb-4 h-5 w-5 text-muted-foreground" />
            <div className="text-3xl font-bold">{stats.openActions}</div>
            <p className="text-xs text-muted-foreground">Open actions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Hammer className="mb-4 h-5 w-5 text-muted-foreground" />
            <div className="text-3xl font-bold">{stats.totalDecisions}</div>
            <p className="text-xs text-muted-foreground">Decisions & Themes logged</p>
          </CardContent>
        </Card>
      </div>

      {/* Panneaux principaux */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {/* Graphique des actions (Barres horizontales robustes à la place du donut pour éviter les crashs de librairies externes) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Action items status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-destructive"></div> Open</span>
                <span>{stats.actionStatus.open}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-destructive" style={{ width: `${(stats.actionStatus.open / totalActions) * 100}%` }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-chart-1"></div> In progress</span>
                <span>{stats.actionStatus['in-progress']}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-chart-1" style={{ width: `${(stats.actionStatus['in-progress'] / totalActions) * 100}%` }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-chart-2"></div> Done</span>
                <span>{stats.actionStatus.done}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-chart-2" style={{ width: `${(stats.actionStatus.done / totalActions) * 100}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Thèmes dominants */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Dominant themes</CardTitle>
            <p className="text-xs text-muted-foreground">Most discussed topics across your meetings</p>
          </CardHeader>
          <CardContent>
            {stats.topThemes.length > 0 ? (
              <div className="space-y-4">
                {stats.topThemes.map((theme, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{theme.name}</span>
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">{theme.count} mentions</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Aucun thème détecté pour le moment.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}