'use client'

import { useEffect, useState, useRef } from 'react'
import Pusher from 'pusher-js'

export default function Home() {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)
  const [userId] = useState(() => Math.random().toString(36).substring(7))
  const pusherRef = useRef(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    // Enable Pusher logging in development
    if (process.env.NODE_ENV === 'development') {
      Pusher.logToConsole = true
    }

    // Initialize Pusher
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      forceTLS: true
    })

    pusherRef.current = pusher

    // Subscribe to channel
    const channel = pusher.subscribe('chat-channel')

    // Connection events
    pusher.connection.bind('connected', () => {
      setConnected(true)
      setError(null)
      console.log('Connected to Pusher')
    })

    pusher.connection.bind('disconnected', () => {
      setConnected(false)
      console.log('Disconnected from Pusher')
    })

    pusher.connection.bind('error', (error) => {
      console.error('Pusher connection error:', error)
      setError('Connection error: ' + error.message)
    })

    // Listen for messages
    channel.bind('new-message', (data) => {
      console.log('Received message:', data)
      setMessages(prev => [...prev, data])
    })

    return () => {
      channel.unbind_all()
      channel.unsubscribe()
      pusher.disconnect()
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    try {
      const response = await fetch('/api/message', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: inputValue,
          userId: userId
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setInputValue('')
        setError(null)
      } else {
        setError(`Failed to send: ${data.error}`)
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to send message: ' + error.message)
    }
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Real-Time Chat with Pusher</h1>
        <div className={`status ${connected ? 'connected' : 'disconnected'}`}>
          {connected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
        {error && (
          <div className="error">
            {error}
          </div>
        )}
      </div>

      <div className="chat-container">
        {messages.map((msg) => (
          <div key={msg.id} className="message">
            <div className="message-header">
              <span className="user">User {msg.userId}</span>
              <span className="time">{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
            <div className="message-text">{msg.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="input-form">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type a message..."
          className="input-field"
          disabled={!connected}
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={!connected || !inputValue.trim()}
        >
          Send
        </button>
      </form>

      <style jsx>{`
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
          height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .header {
          text-align: center;
          margin-bottom: 20px;
        }

        h1 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .status {
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 14px;
          display: inline-block;
        }

        .connected {
          background-color: #d4edda;
          color: #155724;
        }

        .disconnected {
          background-color: #f8d7da;
          color: #721c24;
        }

        .error {
          background-color: #f8d7da;
          color: #721c24;
          padding: 10px;
          border-radius: 8px;
          margin-top: 10px;
          text-align: center;
        }

        .chat-container {
          flex: 1;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          overflow-y: auto;
          background-color: #f9f9f9;
          margin-bottom: 20px;
          min-height: 0;
        }

        .message {
          margin-bottom: 15px;
          padding: 12px 15px;
          border-radius: 8px;
          background-color: white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .message-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
          font-size: 0.85em;
          color: #666;
        }

        .user {
          font-weight: bold;
          color: #007bff;
        }

        .time {
          color: #999;
        }

        .message-text {
          color: #333;
          word-wrap: break-word;
        }

        .input-form {
          display: flex;
          gap: 10px;
        }

        .input-field {
          flex: 1;
          padding: 12px 15px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
          outline: none;
          transition: border-color 0.3s;
        }

        .input-field:focus {
          border-color: #007bff;
        }

        .input-field:disabled {
          background-color: #f5f5f5;
        }

        .send-button {
          padding: 12px 24px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          transition: background-color 0.3s;
        }

        .send-button:hover:not(:disabled) {
          background-color: #0056b3;
        }

        .send-button:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}