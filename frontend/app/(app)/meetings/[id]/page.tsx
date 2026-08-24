'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ReportHeader } from '@/components/report/report-header'
import { TranscriptView } from '@/components/report/transcript-view'
import { DecisionsCard, ActionsCard } from '@/components/report/actions-panel'
import { ParticipantsCard } from '@/components/report/participants-card'
import { Loader2, Clock } from 'lucide-react'

export default function MeetingReportPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [loading, setLoading] = useState(true)
  const [meetingData, setMeetingData] = useState<any>(null)
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [transcriptions, setTranscriptions] = useState<any[]>([])

  const loadData = async () => {
    if (!id) return

    const { data: mData } = await supabase
      .from('reunions')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    setMeetingData(mData)

    if (mData) {
      const { data: aData } = await supabase
        .from('analyses_reunion')
        .select('*')
        .eq('reunion_id', id)
        .maybeSingle()
      setAnalysisData(aData)

      const { data: tData } = await supabase
        .from('transcriptions')
        .select('*')
        .eq('reunion_id', id)
        .order('debut_secondes', { ascending: true })
      setTranscriptions(tData || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()

    // Écoute des mises à jour en direct via Supabase Realtime
    const channel = supabase
      .channel(`reunion-${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reunions', filter: `id=eq.${id}` },
        () => loadData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'analyses_reunion', filter: `reunion_id=eq.${id}` },
        () => loadData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transcriptions', filter: `reunion_id=eq.${id}` },
        () => loadData()
      )
      .subscribe()

    // Polling de secours toutes les 3 secondes si le statut n'est pas terminé
    const interval = setInterval(() => {
      if (meetingData?.statut !== 'termine') {
        loadData()
      }
    }, 3000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [id, meetingData?.statut])

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const isPending = !meetingData || meetingData.statut === 'en_attente' || meetingData.statut === 'en_transcription'

  if (isPending) {
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
            <Clock className="h-3.5 w-3.5" /> Statut : {meetingData?.statut || 'en_attente'}
          </div>
        </div>
      </div>
    )
  }

  const parseJson = (val: any, fallback: any) => {
    if (!val) return fallback
    if (typeof val === 'string') {
      try { return JSON.parse(val) } catch { return fallback }
    }
    return val
  }

  const meeting = {
    id: meetingData.id,
    title: meetingData.titre || 'Compte-rendu de réunion',
    date: meetingData.cree_le ? new Date(meetingData.cree_le).toLocaleDateString('fr-FR') : 'Aujourd\'hui',
    duration: meetingData.duree_secondes ? `${Math.round(meetingData.duree_secondes / 60)} min` : '5 min',
    status: meetingData.statut,
    summary: analysisData?.resume || 'Synthèse générée avec succès.',
    transcript: transcriptions.map((t) => ({
      speaker: t.label_speaker || 'Intervenant',
      time: t.debut_secondes ? `${Math.floor(t.debut_secondes / 60)}:${String(Math.floor(t.debut_secondes % 60)).padStart(2, '0')}` : '0:00',
      text: t.texte || '',
    })),
    decisions: parseJson(analysisData?.themes, []),
    actionItems: parseJson(analysisData?.actions, []),
    participants: [{ name: 'Moi', role: 'Organisateur' }],
    tone: analysisData?.ton || 'Neutre',
    themes: parseJson(analysisData?.themes, ['Général']),
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