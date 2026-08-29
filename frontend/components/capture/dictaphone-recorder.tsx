'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Mic,
  Square,
  RotateCcw,
  Loader2,
  ArrowLeft,
  Send,
  AlertCircle,
} from 'lucide-react'

interface DictaphoneRecorderProps {
  title?: string
  hostName?: string
  onBack?: () => void
}

export function DictaphoneRecorder({
  title = 'Enregistrement Dictaphone',
  hostName,
  onBack,
}: DictaphoneRecorderProps) {
  const router = useRouter()

  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Nettoyage de l'URL audio et des flux à la fermeture
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (audioUrl) URL.revokeObjectURL(audioUrl)
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [audioUrl])

  // Démarrer l'enregistrement micro
  const startRecording = async () => {
    setError(null)
    audioChunksRef.current = []

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start(1000)
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (err: any) {
      setError("Impossible d'accéder au microphone. Vérifiez les autorisations de votre navigateur.")
    }
  }

  // Arrêter l'enregistrement
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  // Recommencer
  const resetRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioBlob(null)
    setAudioUrl(null)
    setRecordingTime(0)
    setError(null)
  }

  // Envoyer l'audio pour analyse et transcription
  const handleSubmit = async () => {
    if (!audioBlob) return
    setLoading(true)
    setError(null)

    try {
      // 1. Récupération de l'utilisateur connecté
      let userEmail =
        typeof window !== 'undefined'
          ? localStorage.getItem('scribe_email') || localStorage.getItem('email')
          : null

      if (!userEmail) {
        const { data: { user } } = await supabase.auth.getUser()
        userEmail = user?.email || null
      }

      if (!userEmail) {
        throw new Error('Aucun compte connecté trouvé. Veuillez vous reconnecter.')
      }

      userEmail = userEmail.trim().toLowerCase()

      // 2. Recherche du tenant_id
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('id')
        .ilike('email', userEmail)
        .maybeSingle()

      if (tenantError || !tenant) {
        throw new Error(`Compte introuvable pour l'e-mail : ${userEmail}`)
      }

      // 3. Upload du fichier dans le bucket Supabase Storage
      const fileName = `dictaphone-${Date.now()}.webm`
      const { error: uploadError } = await supabase.storage
        .from('fichiers_audio')
        .upload(fileName, audioBlob)

      let publicAudioUrl: string | null = null
      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('fichiers_audio')
          .getPublicUrl(fileName)
        publicAudioUrl = urlData.publicUrl
      }

      const finalTitle =
        title ||
        `Enregistrement - ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        })}`

      // 4. Insertion dans la table réunions
      const { data: newMeeting, error: insertError } = await supabase
        .from('reunions')
        .insert([
          {
            titre: finalTitle,
            type_mode: 'dictaphone',
            statut: 'en_attente',
            tenant_id: tenant.id,
            duree_secondes: recordingTime,
            audio_url: publicAudioUrl,
          },
        ])
        .select('id')
        .single()

      if (insertError) throw insertError

      // 5. Enregistrement de l'intervenant
      const speakerName =
        hostName ||
        (typeof window !== 'undefined' ? localStorage.getItem('scribe_display_name') : null) ||
        userEmail.split('@')[0]

      await supabase.from('participants_reunion').insert([
        { reunion_id: newMeeting.id, label_speaker: 'inconnu', nom_reel: speakerName },
        { reunion_id: newMeeting.id, label_speaker: 'speaker_0', nom_reel: speakerName },
        { reunion_id: newMeeting.id, label_speaker: 'Intervenant', nom_reel: speakerName },
      ])

      // 6. Redirection vers la page de détail
      router.push(`/meetings/${newMeeting.id}`)
    } catch (err: any) {
      console.error('Erreur lors de l’envoi :', err)
      setError(err.message || 'Une erreur est survenue lors de l’envoi.')
      setLoading(false)
    }
  }

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {onBack && !isRecording && (
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-xs">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>
      )}

      <Card className="shadow-lg border">
        <CardContent className="flex flex-col items-center justify-center p-8 space-y-6">
          <h2 className="text-xl font-bold text-foreground text-center">
            {title || 'Enregistrement en présentiel'}
          </h2>

          {error && (
            <div className="w-full flex items-center gap-2 rounded-lg bg-destructive/15 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Écran 1 : Enregistrement en cours ou Prêt à enregistrer */}
          {!audioBlob ? (
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`flex h-24 w-24 items-center justify-center rounded-full transition-all shadow-md ${
                    isRecording
                      ? 'bg-destructive text-destructive-foreground animate-pulse scale-105'
                      : 'bg-primary text-primary-foreground hover:scale-105'
                  }`}
                >
                  {isRecording ? <Square className="h-8 w-8" /> : <Mic className="h-10 w-10" />}
                </button>
              </div>

              <div className="text-center space-y-1">
                <p className="font-mono text-3xl font-bold tracking-wider">
                  {formatTimer(recordingTime)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isRecording ? 'Enregistrement en cours... Cliquez pour arrêter' : 'Cliquez sur le micro pour démarrer'}
                </p>
              </div>
            </div>
          ) : (
            /* Écran 2 : Prévisualisation audio & Envoi */
            <div className="w-full flex flex-col items-center space-y-6">
              <div className="w-full rounded-xl bg-secondary/30 p-4">
                <audio controls src={audioUrl || ''} className="w-full h-10 outline-none" />
              </div>

              <div className="flex items-center gap-3 w-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetRecording}
                  disabled={loading}
                  className="flex-1 gap-1.5"
                >
                  <RotateCcw className="h-4 w-4" /> Recommencer
                </Button>

                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 gap-1.5"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      Traitement en cours...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-1" />
                      Envoyer pour analyse
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}