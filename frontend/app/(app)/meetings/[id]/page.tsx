import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getMeeting } from '@/lib/mock-data'
import { ReportHeader } from '@/components/report/report-header'
import { TranscriptView } from '@/components/report/transcript-view'
import { DecisionsCard, ActionsCard } from '@/components/report/actions-panel'
import { ParticipantsCard } from '@/components/report/participants-card'
import { Loader2, Clock } from 'lucide-react'

// Forcer le rendu dynamique pour charger n'importe quel UUID Supabase
export const dynamic = 'force-dynamic'

export default async function MeetingReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // 1. Recherche dans Supabase en priorité
  const { data: dbMeeting, error } = await supabase
    .from('reunions')
    .select('*')
    .eq('id', id)
    .single()

  let meeting: any = null

  if (dbMeeting) {
    // Normalisation des données Supabase pour les composants d'affichage
    meeting = {
      id: dbMeeting.id,
      title: dbMeeting.titre || 'Réunion sans titre',
      date: dbMeeting.created_at ? new Date(dbMeeting.created_at).toLocaleDateString('fr-FR') : 'Aujourd\'hui',
      duration: dbMeeting.duree_secondes ? `${Math.round(dbMeeting.duree_secondes / 60)} min` : '0 min',
      status: dbMeeting.statut,
      summary: dbMeeting.resume || (dbMeeting.statut === 'en_attente' ? 'Traitement audio et analyse IA en cours...' : 'Aucun résumé disponible.'),
      transcript: dbMeeting.transcription_brute || [],
      decisions: dbMeeting.decisions || [],
      actionItems: dbMeeting.actions || [],
      participants: dbMeeting.participants || [{ name: 'Moi', role: 'Organisateur' }],
      tone: dbMeeting.ton || 'Neutre',
      themes: dbMeeting.themes || ['Général'],
    }
  } else {
    // 2. Fallback mock pour les tests locaux (mtg-001, etc.)
    meeting = getMeeting(id)
  }

  if (!meeting) {
    notFound()
  }

  // 3. Affichage d'attente si la synthèse n'est pas encore prête
  if (meeting.status === 'en_attente' && (!meeting.transcript || meeting.transcript.length === 0)) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-card p-12 shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">Analyse en cours</h2>
          <p className="max-w-md text-muted-foreground text-sm">
            L'audio a bien été enregistré. Le pipeline de transcription et de synthèse est en train de traiter les données.
          </p>
          <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> Statut : {meeting.status}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <ReportHeader meeting={meeting} />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <TranscriptView meeting={meeting} />
        </div>
        <div className="space-y-6">
          <DecisionsCard meeting={meeting} />
          <ActionsCard meeting={meeting} />
          <ParticipantsCard meeting={meeting} />
        </div>
      </div>
    </div>
  )
}