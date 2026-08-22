'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mic, Square, Loader2, Sparkles, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function DictaphoneRecorder() {
  const router = useRouter()
  const [isRecording, setIsRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1)
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRecording])

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const rem = secs % 60
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`
  }

  const handleStartRecording = () => {
    setErrorMessage(null)
    setSeconds(0)
    setIsRecording(true)
  }

  const handleStopRecording = async () => {
    setIsRecording(false)
    setIsProcessing(true)
    setErrorMessage(null)

    try {
      // 1. Création de la réunion réelle dans Supabase
      const { data, error } = await supabase
        .from('reunions')
        .insert([
          {
            titre: `Enregistrement Dictaphone - ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
            type: 'dictaphone',
            statut: 'en_cours_traitement',
            duree_secondes: seconds,
          },
        ])
        .select('id')
        .single()

      if (error) throw error

      if (data?.id) {
        // 2. Redirection dynamique vers l'ID réel
        router.push(`/meetings/${data.id}`)
      } else {
        throw new Error('Identifiant de réunion introuvable.')
      }
    } catch (err: any) {
      console.error('Erreur lors de la création de la réunion:', err)
      setErrorMessage(err.message || "Une erreur est survenue lors de l'enregistrement.")
      setIsProcessing(false)
    }
  }

  return (
    <Card className="mx-auto max-w-xl shadow-lg">
      <CardContent className="flex flex-col items-center gap-6 p-8 text-center">
        <div className="relative flex items-center justify-center">
          {isRecording && (
            <span className="absolute h-24 w-24 animate-ping rounded-full bg-red-400 opacity-75" />
          )}
          <div
            className={`flex h-20 w-20 items-center justify-center rounded-full shadow-inner transition-colors ${
              isRecording ? 'bg-destructive text-white' : 'bg-secondary text-foreground'
            }`}
          >
            <Mic className="h-10 w-10" />
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-semibold">
            {isRecording ? 'Enregistrement en cours...' : 'Mode Dictaphone'}
          </h3>
          <p className="font-mono text-3xl font-bold mt-2 text-foreground">
            {formatTime(seconds)}
          </p>
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex gap-4">
          {!isRecording && !isProcessing && (
            <Button size="lg" onClick={handleStartRecording} className="gap-2">
              <Mic className="h-4 w-4" />
              Démarrer l'enregistrement
            </Button>
          )}

          {isRecording && (
            <Button size="lg" variant="destructive" onClick={handleStopRecording} className="gap-2">
              <Square className="h-4 w-4" />
              Arrêter et analyser
            </Button>
          )}

          {isProcessing && (
            <Button size="lg" disabled className="gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Création et transfert en cours...
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}