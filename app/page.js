"use client"
import { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'

export default function Home() {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const newSocket = io('http://localhost:3000', {
      transports: ['websocket', 'polling']
    })

    newSocket.on('connect', () => {
      console.log('Connected to server')
      setConnected(true)
    })

    newSocket.on('message', (data) => {
      setMessages(prev => [...prev, data])
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server')
      setConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = (e) => {
    e.preventDefault()
    if (inputValue.trim() && socket) {
      socket.emit('message', { text: inputValue })
      setInputValue('')
    }
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Real-Time WebSocket Chat</h1>
        <div className={`status ${connected ? 'connected' : 'disconnected'}`}>
          {connected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
      </div>

      <div className="chat-container">
        {messages.map((msg) => (
          <div key={msg.id} className="message">
            <div className="message-header">
              User: {msg.user.substring(0, 8)}... • {new Date(msg.timestamp).toLocaleTimeString()}
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
        }

        .header {
          text-align: center;
          margin-bottom: 20px;
        }

        .status {
          padding: 10px;
          border-radius: 5px;
          margin-bottom: 20px;
          text-align: center;
          font-weight: bold;
        }

        .status.connected {
          background-color: #d4edda;
          color: #155724;
        }

        .status.disconnected {
          background-color: #f8d7da;
          color: #721c24;
        }

        .chat-container {
          border: 1px solid #ddd;
          border-radius: 5px;
          padding: 20px;
          height: 400px;
          overflow-y: auto;
          margin-bottom: 20px;
          background-color: #f9f9f9;
        }

        .message {
          margin-bottom: 10px;
          padding: 10px;
          border-radius: 5px;
          background-color: white;
          border: 1px solid #e0e0e0;
        }

        .message-header {
          font-size: 0.8em;
          color: #666;
          margin-bottom: 5px;
        }

        .message-text {
          word-wrap: break-word;
        }

        .input-form {
          display: flex;
          gap: 10px;
        }

        .input-field {
          flex: 1;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 16px;
        }

        .send-button {
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
          transition: background-color 0.2s;
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