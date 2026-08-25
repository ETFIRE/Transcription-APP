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
import { Loader2, PhoneOff, AlertCircle } from 'lucide-react'

interface VisioCaptureProps {
  title?: string
  onBack?: () => void
}

export function VisioCapture({ title = 'Réunion Visio', onBack }: VisioCaptureProps) {
  const router = useRouter()
  const [token, setToken] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Références pour l'enregistrement audio local
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const roomName = 'salon-principal'

  useEffect(() => {
    async function fetchToken() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        const username = user?.email?.split('@')[0] || `invite_${Math.floor(Math.random() * 1000)}`

        const res = await fetch(`/api/livekit/token?room=${encodeURIComponent(roomName)}&username=${encodeURIComponent(username)}`)
        const data = await res.json()

        if (!res.ok) throw new Error(data.error || 'Impossible d\'obtenir le token LiveKit')
        setToken(data.token)

        startLocalRecording()
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
  }, [])

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
      console.error("Erreur d'accès au micro pour l'enregistrement:", err)
    }
  }

  if (saving) return null;
  
  const handleLeave = async () => {
    setSaving(true)
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
        await new Promise(resolve => setTimeout(resolve, 500)) 
      }

      // 1. Récupérer l'e-mail (localStorage ou fallback Supabase Auth)
      let userEmail = typeof window !== 'undefined' ? localStorage.getItem('scribe_email') : null

      if (!userEmail) {
        const { data: { user } } = await supabase.auth.getUser()
        userEmail = user?.email || null
      }

      if (!userEmail) {
        throw new Error("Aucun utilisateur connecté trouvé. Veuillez vous reconnecter.")
      }

      userEmail = userEmail.trim()

      // 2. Récupérer le tenant_id associé
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('id')
        .eq('email', userEmail)
        .single()

      if (tenantError || !tenant) {
        throw new Error(`Impossible de trouver le tenant pour l'e-mail : ${userEmail}`)
      }

      const tenantId = tenant.id
      const finalTitle = title || `Réunion Visio - ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
      
      let audioUrl = null
      
      // 3. Uploader le fichier audio sur Supabase Storage
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

      // 4. Insérer la réunion en base avec le bon tenant_id
      const { data, error: insertError } = await supabase
        .from('reunions')
        .insert([
          {
            titre: finalTitle,
            type_mode: 'visio',
            statut: 'en_attente',
            tenant_id: tenantId,
            audio_url: audioUrl
          },
        ])
        .select('id')
        .single()

      if (insertError) throw insertError

      if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      }

      if (data?.id) {
        router.push(`/meetings/${data.id}`)
      }
    } catch (err: any) {
      setError(err.message)
      setSaving(false)
    }
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
          <button onClick={onBack} className="mt-2 rounded-lg border border-input bg-background px-4 py-2 text-xs font-medium text-foreground hover:bg-accent">
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
        <span className="text-xs text-muted-foreground">Visioconférence en direct (Enregistrement en cours)</span>
        <button
          onClick={handleLeave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-white transition hover:bg-destructive/90 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Finalisation et Envoi...
            </>
          ) : (
            <>
              <PhoneOff className="h-4 w-4" /> Quitter et générer le compte-rendu
            </>
          )}
        </button>
      </div>
    </div>
  )
}