'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Mic, Square, ArrowLeft } from 'lucide-react'

interface DictaphoneRecorderProps {
  title: string
  onBack: () => void
}

export function DictaphoneRecorder({ title, onBack }: DictaphoneRecorderProps) {
  const [recording, setRecording] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const router = useRouter()

  const startRecording = async () => {
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
      }

      mediaRecorder.start()
      setRecording(true)
    } catch (err) {
      console.error("Erreur accès micro:", err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setRecording(false)
    }
  }

  const handleSubmit = async () => {
    if (!audioBlob) return
    setSubmitting(true)

    try {
      // 1. Récupération de l'e-mail du compte connecté dans le localStorage
      const userEmail = typeof window !== 'undefined' ? localStorage.getItem('scribe_email') : ''

      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      formData.append('titre', title)
      formData.append('type', 'dictaphone')
      
      // 2. Transmission indispensable de l'e-mail pour que n8n cible le bon tenant_id
      formData.append('email', userEmail || '')

      // URL de ton webhook n8n (via variable d'environnement ou en dur)
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'TON_URL_WEBHOOK_N8N'

      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error("Erreur lors de l'envoi de la capture")

      // Redirection propre vers le dashboard
      router.push('/dashboard')
    } catch (err) {
      console.error("Erreur:", err)
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Button>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-6">
          <h2 className="text-xl font-semibold">{title}</h2>

          {!recording && !audioBlob && (
            <Button onClick={startRecording} size="lg" className="gap-2 bg-red-600 hover:bg-red-700 text-white">
              <Mic className="h-5 w-5" /> Démarrer l'enregistrement
            </Button>
          )}

          {recording && (
            <Button onClick={stopRecording} size="lg" variant="destructive" className="gap-2 animate-pulse">
              <Square className="h-5 w-5" /> Arrêter l'enregistrement
            </Button>
          )}

          {audioBlob && !submitting && (
            <div className="flex flex-col items-center gap-4 w-full max-w-md">
              <audio controls src={URL.createObjectURL(audioBlob)} className="w-full" />
              <Button onClick={handleSubmit} size="lg" className="w-full gap-2">
                Envoyer pour analyse
              </Button>
            </div>
          )}

          {submitting && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" /> Analyse en cours...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}