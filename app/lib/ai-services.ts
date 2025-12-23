// app/lib/ai-services.ts
import { OpenAI } from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)

export type AIModel = 'gpt-3.5-turbo' | 'gpt-4' | 'gemini-pro'

export interface AIMessage {
  role: 'user' | 'assistant'
  content: string
}

// Main AI streaming function
export async function streamAIResponse(
  messages: AIMessage[],
  model: AIModel,
  onChunk: (chunk: string) => void
): Promise<string> {
  let fullResponse = ''

  switch (model) {
    case 'gpt-3.5-turbo':
    case 'gpt-4':
      fullResponse = await streamOpenAI(messages, model, onChunk)
      break
    case 'gemini-pro':
      fullResponse = await streamGoogle(messages, onChunk)
      break
    default:
      // Fallback to OpenAI if model not supported
      fullResponse = await streamOpenAI(messages, 'gpt-3.5-turbo', onChunk)
  }

  return fullResponse
}

// OpenAI Streaming
async function streamOpenAI(
  messages: AIMessage[],
  model: 'gpt-3.5-turbo' | 'gpt-4',
  onChunk: (chunk: string) => void
): Promise<string> {
  try {
    const stream = await openai.chat.completions.create({
      model,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      stream: true,
    })

    let fullResponse = ''
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || ''
      if (content) {
        fullResponse += content
        onChunk(content)
      }
    }
    return fullResponse
  } catch (error) {
    console.error('OpenAI Error:', error)
    throw new Error(`OpenAI API Error: ${error.message}`)
  }
}

// Google Gemini Streaming
async function streamGoogle(
  messages: AIMessage[],
  onChunk: (chunk: string) => void
): Promise<string> {
  try {
    const model = googleAI.getGenerativeModel({ model: 'gemini-pro' })
    
    // Get conversation history and last message
    const lastUserMessage = messages
      .filter(m => m.role === 'user')
      .slice(-1)[0]?.content || ''

    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }))

    const chat = model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    })

    const result = await chat.sendMessageStream(lastUserMessage)
    
    let fullResponse = ''
    for await (const chunk of result.stream) {
      const chunkText = chunk.text()
      fullResponse += chunkText
      onChunk(chunkText)
    }
    return fullResponse
  } catch (error) {
    console.error('Google Gemini Error:', error)
    throw new Error(`Google Gemini API Error: ${error.message}`)
  }
}

// Simple one-shot response (non-streaming, for testing)
export async function getAIResponse(
  prompt: string,
  model: AIModel = 'gpt-3.5-turbo'
): Promise<string> {
  const messages: AIMessage[] = [
    { role: 'user', content: prompt }
  ]

  let response = ''
  await streamAIResponse(messages, model, (chunk) => {
    response += chunk
  })
  
  return response
}