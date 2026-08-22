'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Video, PhoneOff, Users, Loader2, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function VisioWireframe() {
  const router = useRouter()
  const [isInCall, setIsInCall] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleEndCall = async () => {
    setIsInCall(false)
    setIsProcessing(true)
    setErrorMessage(null)

    try {
      // 1. Insertion de la session visio dans Supabase
      const { data, error } = await supabase
        .from('reunions')
        .insert([
          {
            titre: `Réunion Visio - ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
            type: 'visio',
            statut: 'en_cours_traitement',
          },
        ])
        .select('id')
        .single()

      if (error) throw error

      if (data?.id) {
        // 2. Redirection directe vers la page de la réunion réelle
        router.push(`/meetings/${data.id}`)
      } else {
        throw new Error('Identifiant de session introuvable.')
      }
    } catch (err: any) {
      console.error('Erreur lors de la fin de la visio:', err)
      setErrorMessage(err.message || 'Impossible de finaliser la réunion.')
      setIsProcessing(false)
      setIsInCall(true)
    }
  }

  return (
    <Card className="mx-auto max-w-2xl overflow-hidden shadow-xl">
      <div className="relative aspect-video w-full bg-neutral-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <Users className="h-16 w-16 text-neutral-500 animate-pulse" />
          <p className="text-sm font-medium text-neutral-400">
            Salon LiveKit connecté — Audio en cours de synchronisation
          </p>
        </div>

        <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
          En direct
        </div>
      </div>

      <CardContent className="flex flex-col items-center gap-4 p-6 bg-card">
        {errorMessage && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive w-full justify-center">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Video className="h-4 w-4" />
            <span>Enregistrement automatique par piste activé</span>
          </div>

          <Button
            variant="destructive"
            onClick={handleEndCall}
            disabled={isProcessing}
            className="gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Génération du rapport...
              </>
            ) : (
              <>
                <PhoneOff className="h-4 w-4" />
                Quitter et voir le compte-rendu
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}