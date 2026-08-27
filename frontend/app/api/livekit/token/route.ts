import { NextRequest, NextResponse } from 'next/server'
import { AccessToken } from 'livekit-server-sdk'

export const dynamic = 'force-dynamic'

async function generateToken(roomName: string, participantName?: string) {
  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET

  if (!apiKey || !apiSecret) {
    throw new Error('Identifiants LiveKit non configurés (LIVEKIT_API_KEY / LIVEKIT_API_SECRET).')
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

  return await at.toJwt()
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const roomName = searchParams.get('room') || searchParams.get('roomName')
    const participantName = searchParams.get('username') || searchParams.get('participantName') || undefined

    if (!roomName) {
      return NextResponse.json({ error: 'Le paramètre room est requis.' }, { status: 400 })
    }

    const token = await generateToken(roomName, participantName)
    return NextResponse.json({ token })
  } catch (err: any) {
    console.error('Erreur GET token LiveKit :', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const roomName = body.room || body.roomName
    const participantName = body.username || body.participantName || undefined

    if (!roomName) {
      return NextResponse.json({ error: 'Le paramètre roomName est requis.' }, { status: 400 })
    }

    const token = await generateToken(roomName, participantName)
    return NextResponse.json({ token })
  } catch (err: any) {
    console.error('Erreur POST token LiveKit :', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}