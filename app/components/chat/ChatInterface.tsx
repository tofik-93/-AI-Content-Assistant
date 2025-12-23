import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Upload, Download, Settings, Menu, X, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

type AIModel = 'gpt-3.5-turbo' | 'gpt-4' | 'gemini-pro'

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'user',
      content: 'Hello AI Assistant! I need help creating content for my blog.',
      timestamp: new Date(),
    },
    {
      id: '2',
      role: 'assistant',
      content: "Hello! I'm your AI Content Assistant. I can help you with:\n\n• Blog posts and articles\n• Social media content\n• Email newsletters\n• Product descriptions\n• Code documentation\n\nWhat would you like to create today?",
      timestamp: new Date(),
    },
  ])
  
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState<AIModel>('gpt-3.5-turbo')
  const [currentChatId, setCurrentChatId] = useState<string>('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chats, setChats] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const models = [
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI' },
    { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI' },
    { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google' },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch chats on mount
  useEffect(() => {
    fetchChats()
  }, [])

  const fetchChats = async () => {
    try {
      const response = await fetch('/api/chats')
      if (!response.ok) throw new Error('Failed to fetch chats')
      const data = await response.json()
      setChats(data.chats || [])
    } catch (error) {
      console.error('Failed to fetch chats:', error)
      // Set mock data if API fails
      setChats([
        {
          id: 'chat-1',
          title: 'Welcome Chat',
          model: 'gpt-3.5-turbo',
          updatedAt: new Date().toISOString(),
          messages: [{ content: 'Welcome to AI Content Assistant!' }]
        }
      ])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      console.log('Sending request to /api/chat...')
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: input }
          ],
          chatId: currentChatId || undefined,
        }),
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('API Response received:', data)
      
      // Add the AI response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content || 'No response content',
        timestamp: new Date(),
      }
      
      setMessages(prev => [...prev, assistantMessage])
      toast.success(`Response from ${selectedModel} received!`)

      // Refresh chat list
      fetchChats()

    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to get response'
      toast.error(errorMessage)
      
      // Add error message as assistant response
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Error: ${errorMessage}. Please check your API configuration.`,
          timestamp: new Date(),
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type === 'application/pdf' || file.type === 'text/plain' || file.name.endsWith('.txt')) {
        const formData = new FormData()
        formData.append('file', file)
        if (currentChatId) formData.append('chatId', currentChatId)
        
        try {
          const response = await fetch('/api/documents', {
            method: 'POST',
            body: formData,
          })
          
          if (response.ok) {
            const data = await response.json()
            toast.success(`Uploaded: ${data.document?.fileName || file.name}`)
          } else {
            toast.error('Failed to upload file')
          }
        } catch (error) {
          console.error('Upload error:', error)
          toast.error('Upload failed')
        }
      } else {
        toast.error('Please upload only PDF or TXT files')
      }
    }
  }

  const exportChat = () => {
    const chatText = messages.map(m => 
      `[${m.timestamp.toLocaleTimeString()}] ${m.role === 'user' ? 'You' : 'AI'}: ${m.content}`
    ).join('\n\n')
    
    const blob = new Blob([chatText], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-chat-${new Date().toISOString().split('T')[0]}.md`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Chat exported as Markdown!')
  }

  const createNewChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: "Hello! I'm your AI Content Assistant. How can I help you today?",
        timestamp: new Date(),
      }
    ])
    setCurrentChatId('')
    setInput('')
    toast.success('New chat started')
  }

  const deleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, { 
        method: 'DELETE' 
      })
      
      if (response.ok) {
        toast.success('Chat deleted')
        fetchChats()
        if (currentChatId === chatId) {
          createNewChat()
        }
      } else {
        toast.error('Failed to delete chat')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete chat')
    }
  }

  const loadChat = (chatId: string) => {
    // For now, just set the current chat ID
    // In a real app, you would fetch the chat messages
    setCurrentChatId(chatId)
    toast.success(`Switched to chat: ${chats.find(c => c.id === chatId)?.title || 'Untitled'}`)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm md:px-6 md:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Bot className="w-5 h-5 text-white md:w-6 md:h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800 md:text-2xl">AI Content Assistant</h1>
                <p className="text-xs text-gray-600 md:text-sm">Local Development Mode</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-3">
            <button
              onClick={exportChat}
              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm md:space-x-2 md:px-4 md:py-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline text-sm md:text-base">Export</span>
            </button>
            <button
              onClick={createNewChat}
              className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm md:space-x-2 md:px-4 md:py-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline text-sm md:text-base">New Chat</span>
            </button>
            <button className="p-1.5 hover:bg-gray-100 rounded-lg transition">
              <Settings className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Mobile overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <aside className={`
          fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 
          transform transition-transform duration-300 ease-in-out flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:w-64
        `}>
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">AI Models</h2>
            <div className="space-y-2">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id as AIModel)}
                  disabled={isLoading}
                  className={`w-full p-3 rounded-lg border transition-all text-left ${selectedModel === model.id
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{model.name}</p>
                      <p className="text-xs text-gray-600">{model.provider}</p>
                    </div>
                    {selectedModel === model.id && (
                      <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload Documents</h2>
            <label className="block">
              <div className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 cursor-pointer transition bg-gray-50 hover:bg-blue-50">
                <Upload className="w-6 h-6 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600 font-medium">Upload PDF or TXT</span>
                <span className="text-xs text-gray-500 mt-1">For AI analysis</span>
              </div>
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isLoading}
              />
            </label>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Chat History</h2>
            <div className="space-y-2">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${currentChatId === chat.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => loadChat(chat.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">
                        {chat.title || 'Untitled Chat'}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {chat.messages?.[0]?.content || 'No messages yet'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(chat.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteChat(chat.id)
                      }}
                      className="ml-2 p-1 text-gray-400 hover:text-red-500"
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {chats.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No chat history yet</p>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
            <h3 className="font-semibold text-gray-800 mb-2">System Status</h3>
            <div className="space-y-1 text-sm">
              <div className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Chat Interface Ready
              </div>
              <div className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Mock APIs Active
              </div>
              <div className="flex items-center text-blue-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Model: {selectedModel}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full inline-block mb-4">
                    <Bot className="w-12 h-12 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Start a conversation</h3>
                  <p className="text-gray-600 max-w-md">
                    Ask me anything about content creation, blog posts, social media, or upload a document for analysis.
                  </p>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg mx-auto">
                    <button 
                      onClick={() => setInput("Help me write a blog post about AI trends")}
                      className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-left"
                    >
                      ✍️ Blog post about AI trends
                    </button>
                    <button 
                      onClick={() => setInput("Create social media posts for my product launch")}
                      className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-left"
                    >
                      📱 Social media content
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-2xl rounded-2xl px-4 py-3 ${message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-none shadow-md'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <div className={`p-1.5 rounded-lg ${message.role === 'user' ? 'bg-blue-700' : 'bg-gray-100'}`}>
                        {message.role === 'user' ? (
                          <User className="w-3.5 h-3.5" />
                        ) : (
                          <Bot className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="ml-2">
                        <span className="font-semibold text-sm">
                          {message.role === 'user' ? 'You' : 'AI Assistant'}
                        </span>
                        <span className="ml-3 text-xs opacity-75">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <div className="whitespace-pre-wrap text-sm md:text-base">
                      {message.content}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] md:max-w-2xl rounded-2xl rounded-bl-none bg-white border border-gray-200 shadow-sm px-4 py-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 rounded-lg bg-gray-100">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse delay-300"></div>
                    </div>
                    <span className="text-sm text-gray-500">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white p-4">
            <form onSubmit={handleSubmit} className="flex space-x-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything or upload a document..."
                  className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base disabled:bg-gray-100"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  disabled={isLoading}
                >
                  <Upload className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition flex items-center space-x-2 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="hidden sm:inline">Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden sm:inline">Send</span>
                  </>
                )}
              </button>
            </form>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">
                Using: <span className="font-medium">{models.find(m => m.id === selectedModel)?.name}</span>
              </p>
              <p className="text-xs text-gray-500">
                {messages.length} messages • Local Mode
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}