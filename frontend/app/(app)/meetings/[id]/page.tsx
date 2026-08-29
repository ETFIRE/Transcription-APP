'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Loader2,
  ArrowLeft,
  Volume2,
  Download,
  FileText,
  CheckCircle2,
  ListTodo,
  Clock,
  Calendar,
  Sparkles,
  Copy,
  Check,
  Video,
  Mic,
  MessageSquare,
  User,
  Edit2,
} from 'lucide-react'

function formatSeconds(seconds?: number | null) {
  if (seconds == null) return ''
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function MeetingDetailPage() {
  const params = useParams()
  const meetingId = params.id as string
  const router = useRouter()

  const [meeting, setMeeting] = useState<any>(null)
  const [participants, setParticipants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript'>('summary')

  useEffect(() => {
    let interval: NodeJS.Timeout

    async function fetchMeeting() {
      if (!meetingId) return

      try {
        const { data, error } = await supabase
          .from('reunions')
          .select(`
            *,
            analyses_reunion (*),
            transcriptions (*),
            participants_reunion (*)
          `)
          .eq('id', meetingId)
          .maybeSingle()

        if (error) throw error
        setMeeting(data)
        setParticipants(data?.participants_reunion || [])

        if (data && (data.statut === 'en_attente' || data.statut === 'traitement')) {
          interval = setInterval(async () => {
            const { data: updated } = await supabase
              .from('reunions')
              .select(`
                *,
                analyses_reunion (*),
                transcriptions (*),
                participants_reunion (*)
              `)
              .eq('id', meetingId)
              .maybeSingle()

            if (updated && updated.statut !== 'en_attente' && updated.statut !== 'traitement') {
              setMeeting(updated)
              setParticipants(updated?.participants_reunion || [])
              clearInterval(interval)
            }
          }, 3000)
        }
      } catch (err) {
        console.error('Erreur chargement réunion :', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMeeting()

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [meetingId])

  const analysis = Array.isArray(meeting?.analyses_reunion)
    ? meeting.analyses_reunion[0]
    : meeting?.analyses_reunion || null

  const summary = analysis?.resume || meeting?.description || ''

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

  const transcriptions: any[] = Array.isArray(meeting?.transcriptions)
    ? [...meeting.transcriptions].sort((a, b) => (a.debut_secondes || 0) - (b.debut_secondes || 0))
    : []

  const getSpeakerName = (label: string) => {
    const p = participants.find((part) => part.label_speaker === label)
    if (p?.nom_reel) return p.nom_reel
    if (participants.length > 0 && participants[0]?.nom_reel) {
      return participants[0].nom_reel
    }
    return label || 'Intervenant'
  }

  const handleRenameSpeaker = async (currentLabel: string) => {
    const currentName = getSpeakerName(currentLabel)
    const newName = prompt(`Nom de l'intervenant pour "${currentLabel}" :`, currentName)
    if (!newName || newName.trim() === '' || newName === currentName) return

    const trimmedName = newName.trim()

    // Enregistrer ou mettre à jour dans Supabase
    const { error } = await supabase.from('participants_reunion').upsert(
      {
        reunion_id: meetingId,
        label_speaker: currentLabel,
        nom_reel: trimmedName,
      },
      { onConflict: 'reunion_id,label_speaker' }
    )

    if (!error) {
      setParticipants((prev) => {
        const filtered = prev.filter((p) => p.label_speaker !== currentLabel)
        return [...filtered, { label_speaker: currentLabel, nom_reel: trimmedName }]
      })
    }
  }

  const durationMin = meeting?.duree_secondes ? Math.max(1, Math.round(meeting.duree_secondes / 60)) : 0

  const handleCopySummary = () => {
    if (!meeting) return
    const actionsFormatted = actions
      .map((a: any) => `- ${typeof a === 'string' ? a : a.tache || a.description || JSON.stringify(a)}`)
      .join('\n')

    const textToCopy = `${meeting.titre || 'Réunion'}\n\nRésumé :\n${summary}\n\nActions :\n${actionsFormatted}`
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Chargement de la réunion...</p>
      </div>
    )
  }

  if (!meeting) {
    return (
      <div className="mx-auto max-w-xl p-8 text-center space-y-4">
        <h2 className="text-xl font-bold">Réunion introuvable</h2>
        <p className="text-sm text-muted-foreground">Cette réunion n'existe pas ou a été supprimée.</p>
        <Button onClick={() => router.push('/history')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour à l'historique
        </Button>
      </div>
    )
  }

  const formattedDate = meeting.cree_le
    ? new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(meeting.cree_le))
    : 'Date inconnue'

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/history"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Retour à l'historique
        </Link>

        <div className="flex items-center gap-2">
          {meeting.audio_url && (
            <a href={meeting.audio_url} download={`${meeting.titre || 'enregistrement'}.webm`} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Download className="h-3.5 w-3.5" /> Télécharger l'audio source
              </Button>
            </a>
          )}
          <Button variant="outline" size="sm" onClick={handleCopySummary} className="gap-1.5 text-xs">
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
            {copied ? 'Copié !' : 'Copier le résumé'}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" /> {formattedDate}
          <span>•</span>
          <Clock className="h-3.5 w-3.5" /> {durationMin} min
          <span>•</span>
          <span className="flex items-center gap-1 uppercase tracking-wider text-[11px] font-semibold">
            {meeting.type_mode === 'visio' ? <Video className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
            {meeting.type_mode || 'visio'}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{meeting.titre || 'Sans titre'}</h1>
      </div>

      {meeting.audio_url ? (
        <Card className="border-border/60 bg-secondary/20 shadow-sm">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Volume2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Enregistrement audio source</p>
                <p className="text-xs text-muted-foreground">Écoutez la session originale intégrale</p>
              </div>
            </div>
            <audio controls className="w-full sm:max-w-md h-9 outline-none">
              <source src={meeting.audio_url} type="audio/webm" />
              <source src={meeting.audio_url} type="audio/mp3" />
              Votre navigateur ne prend pas en charge le lecteur audio.
            </audio>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground flex items-center gap-2">
          <Volume2 className="h-4 w-4 opacity-50" /> Aucun flux audio source disponible pour cette réunion.
        </div>
      )}

      {(meeting.statut === 'en_attente' || meeting.statut === 'traitement') && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-primary">
          <Loader2 className="h-5 w-5 animate-spin shrink-0" />
          <div>
            <p className="font-semibold">Transcription et analyse IA en cours...</p>
            <p className="text-xs text-muted-foreground">Les résultats s'afficheront automatiquement dès qu'ils seront prêts.</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'summary'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sparkles className="h-4 w-4" /> Compte-rendu IA
        </button>
        <button
          onClick={() => setActiveTab('transcript')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'transcript'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="h-4 w-4" /> Transcription texte ({transcriptions.length})
        </button>
      </div>

      {activeTab === 'summary' && (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-6 md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-brand" /> Synthèse & Résumé
                </CardTitle>
                {analysis?.ton && (
                  <CardDescription>Ton détecté : <span className="font-medium text-foreground">{analysis.ton}</span></CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                {summary || <span className="italic text-muted-foreground">Aucun résumé disponible pour le moment.</span>}
              </CardContent>
            </Card>

            {actions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ListTodo className="h-4 w-4 text-brand" /> Actions & Décisions ({actions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {actions.map((action: any, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span>{typeof action === 'string' ? action : action.tache || action.description || JSON.stringify(action)}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {themes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Thématiques & Thèmes
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-1.5">
                  {themes.map((theme: string, i: number) => (
                    <span
                      key={i}
                      className="rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                    >
                      {theme}
                    </span>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Informations session
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>ID :</span>
                  <span className="font-mono text-[11px] text-foreground">{meeting.id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span>Format :</span>
                  <span className="font-medium text-foreground">{meeting.type_mode === 'visio' ? 'Visioconférence' : 'Dictaphone'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Statut :</span>
                  <span className="capitalize text-foreground">{meeting.statut}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'transcript' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" /> Transcription intégrale
            </CardTitle>
            <CardDescription>Segments audio transcrits par intervenant. Cliquez sur le nom pour le modifier.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {transcriptions.length > 0 ? (
              <div className="space-y-3">
                {transcriptions.map((t: any, index: number) => {
                  const speakerName = getSpeakerName(t.label_speaker)
                  return (
                    <div key={t.id || index} className="rounded-xl border bg-secondary/20 p-4 space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <button
                          onClick={() => handleRenameSpeaker(t.label_speaker)}
                          className="flex items-center gap-1.5 font-semibold text-primary hover:underline group cursor-pointer"
                          title="Cliquer pour renommer l'intervenant"
                        >
                          <User className="h-3.5 w-3.5" />
                          <span>{speakerName}</span>
                          <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                        </button>
                        {(t.debut_secondes != null || t.fin_secondes != null) && (
                          <span className="font-mono text-[11px]">
                            {formatSeconds(t.debut_secondes)} - {formatSeconds(t.fin_secondes)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed text-foreground">{t.texte}</p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Aucune transcription enregistrée pour cette réunion.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}