import { useCallback, useEffect, useRef, useState } from 'react'
import { checkHealth, sendMessage, uploadPdf } from './api'
import ChatInput from './components/ChatInput'
import Header from './components/Header'
import MessageList from './components/MessageList'
import './App.css'

export default function App() {
  const [messages, setMessages] = useState([])
  const [sessionId, setSessionId] = useState(null)
  const [filename, setFilename] = useState(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [ollamaOnline, setOllamaOnline] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    checkHealth()
      .then((data) => setOllamaOnline(data.ollama === 'connected'))
      .catch(() => setOllamaOnline(false))
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleFile = useCallback(async (file) => {
    if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a PDF file.')
      return
    }

    setError(null)
    setUploading(true)
    setMessages([])
    setSessionId(null)
    setFilename(null)

    try {
      const data = await uploadPdf(file)
      setSessionId(data.sessionId)
      setFilename(data.filename)
      setMessages([
        {
          id: 'summary',
          role: 'assistant',
          content: `**Summary of "${data.filename}"**\n\n${data.summary}`,
        },
      ])
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }, [])

  const onFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const onDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text || !sessionId || loading) return

    setInput('')
    setError(null)
    setLoading(true)

    const userMsg = { id: Date.now().toString(), role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])

    try {
      const data = await sendMessage(sessionId, text)
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: data.reply },
      ])
    } catch (err) {
      setError(err.message)
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id))
      setInput(text)
    } finally {
      setLoading(false)
      textareaRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const resetSession = () => {
    setSessionId(null)
    setFilename(null)
    setMessages([])
    setInput('')
    setError(null)
  }

  const hasSession = Boolean(sessionId)

  return (
    <div className="app">
      <Header ollamaOnline={ollamaOnline} />

      <main className="chat-main">
        <MessageList
          messages={messages}
          hasSession={hasSession}
          filename={filename}
          loading={loading}
          uploading={uploading}
          dragOver={dragOver}
          messagesEndRef={messagesEndRef}
          fileInputRef={fileInputRef}
          onDragOver={onDragOver}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onFileChange={onFileChange}
        />

        <ChatInput
          hasSession={hasSession}
          input={input}
          loading={loading}
          error={error}
          textareaRef={textareaRef}
          onInputChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onSend={handleSend}
          onReset={resetSession}
        />
      </main>
    </div>
  )
}
