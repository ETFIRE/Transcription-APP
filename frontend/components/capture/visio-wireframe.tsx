'use client'

import '@livekit/components-styles'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react'
import { supabase } from '@/lib/supabase'
import { Loader2, PhoneOff, AlertCircle, LogOut } from 'lucide-react'

interface VisioCaptureProps {
  title?: string
  isHost?: boolean
  roomName?: string
  initialToken?: string
  onBack?: () => void
}

export function VisioCapture({
  title = 'Réunion Visio',
  isHost = true,
  roomName = 'salon-principal',
  initialToken,
  onBack,
}: VisioCaptureProps) {
  const router = useRouter()
  const [token, setToken] = useState<string>(initialToken || '')
  const [loading, setLoading] = useState(!initialToken)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Références pour l'enregistrement audio local de l'hôte
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    async function fetchToken() {
      if (initialToken) {
        setToken(initialToken)
        setLoading(false)
        if (isHost) startLocalRecording()
        return
      }

      try {
        const storedEmail =
          typeof window !== 'undefined'
            ? localStorage.getItem('scribe_email') || localStorage.getItem('email')
            : null

        const username = storedEmail?.split('@')[0] || `user_${Math.floor(Math.random() * 1000)}`

        const res = await fetch(
          `/api/livekit/token?room=${encodeURIComponent(roomName)}&username=${encodeURIComponent(username)}`
        )
        const data = await res.json()

        if (!res.ok) throw new Error(data.error || "Impossible d'obtenir le token LiveKit")
        setToken(data.token)

        if (isHost) {
          startLocalRecording()
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchToken()

    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [initialToken, roomName, isHost])

  const startLocalRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.start(1000)
    } catch (err) {
      console.error("Erreur d'accès au micro pour l'enregistrement hôte :", err)
    }
  }

  const handleLeave = async () => {
    // 1. Déconnexion simple pour l'invité
    if (!isHost) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
      }
      router.push('/dashboard')
      return
    }

    // 2. Traitement complet pour l'hôte (création réunion + envoi audio IA)
    setSaving(true)
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      let userEmail =
        typeof window !== 'undefined'
          ? localStorage.getItem('scribe_email') || localStorage.getItem('email')
          : null

      if (!userEmail) {
        const { data: { user } } = await supabase.auth.getUser()
        userEmail = user?.email || null
      }

      if (!userEmail) {
        throw new Error('Aucun utilisateur connecté trouvé. Veuillez vous reconnecter.')
      }

      userEmail = userEmail.trim().toLowerCase()

      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('id')
        .ilike('email', userEmail)
        .single()

      if (tenantError || !tenant) {
        throw new Error(`Impossible de trouver le tenant pour : ${userEmail}`)
      }

      const tenantId = tenant.id
      const finalTitle =
        title ||
        `Réunion Visio - ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        })}`

      let audioUrl = null

      if (audioChunksRef.current.length > 0) {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const fileName = `visio-${Date.now()}.webm`

        const { error: uploadError } = await supabase.storage
          .from('fichiers_audio')
          .upload(fileName, audioBlob)

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('fichiers_audio')
            .getPublicUrl(fileName)
          audioUrl = publicUrlData.publicUrl
        }
      }

      const { data, error: insertError } = await supabase
        .from('reunions')
        .insert([
          {
            titre: finalTitle,
            type_mode: 'visio',
            statut: 'en_attente',
            tenant_id: tenantId,
            audio_url: audioUrl,
          },
        ])
        .select('id')
        .single()

      if (insertError) throw insertError

      if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
      }

      if (data?.id) {
        router.push(`/meetings/${data.id}`)
      }
    } catch (err: any) {
      setError(err.message)
      setSaving(false)
    }
  }

  if (saving) {
    return (
      <div className="flex h-[550px] flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-6 shadow-lg">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-base font-medium">Finalisation et génération du compte-rendu en cours...</p>
        <p className="text-xs text-muted-foreground">Veuillez patienter pendant l'envoi de l'enregistrement audio.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-6 shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Connexion à la salle vidéo LiveKit...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/25 bg-destructive/10 p-8 text-center">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm font-medium text-destructive">{error}</p>
        {onBack && (
          <button
            onClick={onBack}
            className="mt-2 rounded-lg border border-input bg-background px-4 py-2 text-xs font-medium text-foreground hover:bg-accent"
          >
            Retour
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl border border-border bg-black shadow-lg">
      <div className="h-[550px] w-full">
        <LiveKitRoom
          video={true}
          audio={true}
          token={token}
          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
          data-lk-theme="default"
          style={{ height: '100%' }}
          onDisconnected={handleLeave}
        >
          <VideoConference />
          <RoomAudioRenderer />
        </LiveKitRoom>
      </div>

      <div className="flex items-center justify-between border-t border-border/40 bg-card p-4">
        <span className="text-xs text-muted-foreground">
          {isHost
            ? 'Visioconférence en direct (Enregistrement de la session par l’hôte)'
            : 'Visioconférence en direct (Session invité)'}
        </span>

        {isHost ? (
          <button
            onClick={handleLeave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-white transition hover:bg-destructive/90 disabled:opacity-50"
          >
            <PhoneOff className="h-4 w-4" /> Quitter et générer le compte-rendu
          </button>
        ) : (
          <button
            onClick={handleLeave}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground transition hover:bg-destructive hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Quitter la réunion
          </button>
        )}
      </div>
    </div>
  )
}