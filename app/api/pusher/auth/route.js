import Pusher from 'pusher'
import { NextResponse } from 'next/server'

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  useTLS: true
})

export async function POST(request) {
  const { socket_id, channel_name } = await request.json()
  
  const authResponse = pusher.authorizeChannel(socket_id, channel_name)
  return NextResponse.json(authResponse)
}