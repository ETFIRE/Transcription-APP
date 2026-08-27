import { NextResponse } from 'next/server'
import { AccessToken } from 'livekit-server-sdk'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { roomName, participantName } = await req.json()

    if (!roomName) {
      return NextResponse.json({ error: 'roomName requis.' }, { status: 400 })
    }

    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET

    if (!apiKey || !apiSecret) {
      return NextResponse.json({ error: 'Identifiants LiveKit non configurés.' }, { status: 500 })
    }

    const identity = participantName || `guest_${Math.random().toString(36).substring(7)}`

    const at = new AccessToken(apiKey, apiSecret, {
      identity,
      name: identity,
      ttl: '2h',
    })

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    })

    const token = await at.toJwt()

    return NextResponse.json({ token })
  } catch (err: any) {
    console.error('Erreur génération token LiveKit :', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}