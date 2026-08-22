import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getMeeting } from '@/lib/mock-data'
import { ReportHeader } from '@/components/report/report-header'
import { TranscriptView } from '@/components/report/transcript-view'
import { DecisionsCard, ActionsCard } from '@/components/report/actions-panel'
import { ParticipantsCard } from '@/components/report/participants-card'
import { Loader2, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function MeetingReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let dbMeeting: any = null
  let dbAnalysis: any = null
  let dbTranscriptions: any[] = []

  try {
    // 1. Récupération de la réunion
    const { data: mData } = await supabase
      .from('reunions')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    dbMeeting = mData

    if (dbMeeting) {
      // 2. Récupération de l'analyse (résumé, actions, décisions)
      const { data: aData } = await supabase
        .from('analyses_reunion')
        .select('*')
        .eq('reunion_id', id)
        .maybeSingle()
      dbAnalysis = aData

      // 3. Récupération des transcriptions découpées
      const { data: tData } = await supabase
        .from('transcriptions')
        .select('*')
        .eq('reunion_id', id)
        .order('debut_secondes', { ascending: true })
      dbTranscriptions = tData || []
    }
  } catch (e) {
    console.error('Erreur Supabase:', e)
  }

  let meeting: any = null

  if (dbMeeting) {
    // Parser les formats si nécessaire
    const parseJson = (val: any, fallback: any) => {
      if (!val) return fallback
      if (typeof val === 'string') {
        try { return JSON.parse(val) } catch { return fallback }
      }
      return val
    }

    const transcriptFormatted = dbTranscriptions.length > 0
      ? dbTranscriptions.map((t) => ({
          speaker: t.label_speaker || 'Intervenant',
          time: t.debut_secondes ? `${Math.floor(t.debut_secondes / 60)}:${String(Math.floor(t.debut_secondes % 60)).padStart(2, '0')}` : '0:00',
          text: t.texte || '',
        }))
      : []

    meeting = {
      id: dbMeeting.id,
      title: dbMeeting.titre || 'Compte-rendu de réunion',
      date: dbMeeting.cree_le ? new Date(dbMeeting.cree_le).toLocaleDateString('fr-FR') : 'Aujourd\'hui',
      duration: dbMeeting.duree_secondes ? `${Math.round(dbMeeting.duree_secondes / 60)} min` : '5 min',
      status: dbMeeting.statut,
      summary: dbAnalysis?.resume || (dbMeeting.statut === 'en_attente' ? 'Traitement audio et analyse IA en cours...' : 'Aucun résumé disponible.'),
      transcript: transcriptFormatted,
      decisions: parseJson(dbAnalysis?.themes, []),
      actionItems: parseJson(dbAnalysis?.actions, []),
      participants: [{ name: 'Moi', role: 'Organisateur' }],
      tone: dbAnalysis?.ton || 'Neutre',
      themes: parseJson(dbAnalysis?.themes, ['Général']),
    }
  } else {
    meeting = getMeeting(id)
  }

  if (!meeting) {
    notFound()
  }

  // Affichage attente si en cours de traitement
  if (meeting.status === 'en_attente' || (meeting.transcript.length === 0 && !dbAnalysis?.resume)) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-card p-12 shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">Analyse en cours</h2>
          <p className="max-w-md text-muted-foreground text-sm">
            L'enregistrement a bien été reçu. L'IA génère la transcription et la synthèse.
          </p>
          <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> Statut : {meeting.status || 'en_attente'}
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