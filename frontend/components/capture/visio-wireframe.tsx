'use client'

import '@livekit/components-styles'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react'
import { supabase } from '@/lib/supabase'
import { getCurrentTenantId } from '@/lib/get-tenant'
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
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchToken()
  }, [])

  const handleLeave = async () => {
    setSaving(true)
    try {
      const tenantId = await getCurrentTenantId()

      const finalTitle = title || `Réunion Visio - ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`

      const { data, error: insertError } = await supabase
        .from('reunions')
        .insert([
          {
            titre: finalTitle,
            type_mode: 'visio',
            statut: 'en_attente',
            tenant_id: tenantId,
          },
        ])
        .select('id')
        .single()

      if (insertError) throw insertError
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
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-8 text-center">
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
        >
          <VideoConference />
          <RoomAudioRenderer />
        </LiveKitRoom>
      </div>

      <div className="flex items-center justify-between border-t border-border/40 bg-card p-4">
        <span className="text-xs text-muted-foreground">Visioconférence en direct</span>
        <button
          onClick={handleLeave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-white transition hover:bg-destructive/90 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Finalisation...
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