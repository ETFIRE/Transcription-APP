'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getCurrentTenantId } from '@/lib/get-tenant'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mic, Square, Loader2, AlertCircle } from 'lucide-react'

interface DictaphoneRecorderProps {
  title?: string
  onBack?: () => void
}

export function DictaphoneRecorder({ title = 'Réunion', onBack }: DictaphoneRecorderProps) {
  const router = useRouter()
  const [isRecording, setIsRecording] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [time, setTime] = useState(0)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data)
      }

      mediaRecorder.start(1000)
      setIsRecording(true)
      
      timerRef.current = setInterval(() => {
        setTime((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      setError("Impossible d'accéder au microphone.")
    }
  }

  const stopRecordingAndSave = async () => {
    if (!mediaRecorderRef.current) return
    
    setIsRecording(false)
    setSaving(true)
    if (timerRef.current) clearInterval(timerRef.current)

    mediaRecorderRef.current.stop()
    // Laisser le temps au dernier chunk de s'ajouter
    await new Promise(resolve => setTimeout(resolve, 500))

    try {
      const tenantId = await getCurrentTenantId()
      const finalTitle = title || `Enregistrement vocal - ${new Date().toLocaleDateString()}`
      let audioUrl = null

      if (audioChunksRef.current.length > 0) {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const fileName = `dictaphone-${Date.now()}.webm`

        const { error: uploadError } = await supabase.storage
          .from('fichiers_audio')
          .upload(fileName, audioBlob)

        if (!uploadError) {
          const { data } = supabase.storage.from('fichiers_audio').getPublicUrl(fileName)
          audioUrl = data.publicUrl
        }
      }

      const { data, error: insertError } = await supabase
        .from('reunions')
        .insert([{
            titre: finalTitle,
            type_mode: 'presentiel',
            statut: 'en_attente',
            tenant_id: tenantId,
            duree_secondes: time,
            audio_url: audioUrl
        }])
        .select('id')
        .single()

      if (insertError) throw insertError

      // Couper l'utilisation du micro
      if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      }

      if (data?.id) router.push(`/meetings/${data.id}`)
      
    } catch (err: any) {
      setError(err.message)
      setSaving(false)
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <Card className="mx-auto max-w-md border-border bg-card shadow-sm">
      <CardContent className="flex flex-col items-center justify-center p-10 text-center">
        {error ? (
          <div className="flex flex-col items-center gap-3 text-destructive">
            <AlertCircle className="h-8 w-8" />
            <p className="text-sm">{error}</p>
            {onBack && <Button variant="outline" onClick={onBack} className="mt-4">Retour</Button>}
          </div>
        ) : saving ? (
          <div className="flex flex-col items-center gap-4 text-primary">
            <Loader2 className="h-10 w-10 animate-spin" />
            <p className="text-sm font-medium">Finalisation de l'enregistrement...</p>
          </div>
        ) : (
          <>
            <div className={`mb-8 flex h-24 w-24 items-center justify-center rounded-full ${isRecording ? 'animate-pulse bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
              <Mic className="h-10 w-10" />
            </div>
            <div className="mb-8 font-mono text-4xl font-light tracking-tighter text-foreground">
              {formatTime(time)}
            </div>
            
            {!isRecording ? (
              <Button onClick={startRecording} size="lg" className="w-full max-w-[200px] rounded-full gap-2">
                <Mic className="h-4 w-4" /> Commencer
              </Button>
            ) : (
              <Button onClick={stopRecordingAndSave} variant="destructive" size="lg" className="w-full max-w-[200px] rounded-full gap-2">
                <Square className="h-4 w-4" /> Arrêter et analyser
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}