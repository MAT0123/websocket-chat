import { NextResponse } from 'next/server'
import Pusher from 'pusher'

// Create Pusher instance outside the handler to reuse it
let pusher

try {
  pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.NEXT_PUBLIC_PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    useTLS: true
  })
} catch (error) {
  console.error('Failed to initialize Pusher:', error)
}

export async function POST(request) {
  console.log('API route called')
  
  try {
    // Log environment variables (without exposing secrets)
    console.log('Pusher config check:', {
      hasAppId: !!process.env.PUSHER_APP_ID,
      hasKey: !!process.env.NEXT_PUBLIC_PUSHER_KEY,
      hasSecret: !!process.env.PUSHER_SECRET,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER
    })

    // Check if Pusher is initialized
    if (!pusher) {
      console.error('Pusher not initialized')
      return NextResponse.json(
        { error: 'Pusher configuration error' },
        { status: 500 }
      )
    }

    // Parse request body
    let body
    try {
      body = await request.json()
      console.log('Request body:', body)
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError)
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const { message, userId } = body

    // Validate input
    if (!message || !userId) {
      console.error('Missing required fields:', { message: !!message, userId: !!userId })
      return NextResponse.json(
        { error: 'Message and userId are required' },
        { status: 400 }
      )
    }

    // Try to send via Pusher
    console.log('Attempting to trigger Pusher event...')
    
    const result = await pusher.trigger('chat-channel', 'new-message', {
      id: Date.now(),
      text: message,
      userId: userId,
      timestamp: new Date().toISOString()
    })
    
    console.log('Pusher trigger successful:', result)
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Error in message API:', error)
    console.error('Error stack:', error.stack)
    
    // Return a proper error response
    return NextResponse.json(
      { 
        error: 'Failed to send message',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// Add a GET method for testing
export async function GET() {
  return NextResponse.json({ 
    status: 'API route is working',
    pusherConfigured: !!pusher,
    timestamp: new Date().toISOString()
  })
}