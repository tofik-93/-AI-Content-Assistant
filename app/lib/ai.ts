import { OpenAI } from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)

export async function streamAIResponse(
  model: string,
  messages: Array<{ role: string; content: string }>
) {
  try {
    // Prepare conversation (remove system prompt for now)
    const conversation = messages.filter(m => m.role !== 'system')
    
    switch (model) {
      case 'gpt-3.5-turbo':
      case 'gpt-4':
        return await openai.chat.completions.create({
          model,
          messages: conversation.map(m => ({
            role: m.role as 'user' | 'assistant' | 'system',
            content: m.content
          })),
          stream: true,
        })

      case 'gemini-pro':
        const geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' })
        
        // Format for Gemini - take last user message
        const lastUserMessage = conversation
          .filter(m => m.role === 'user')
          .pop()?.content || ''
          
        const result = await geminiModel.generateContentStream(lastUserMessage)
        return result

      default:
        throw new Error(`Unsupported model: ${model}`)
    }
  } catch (error) {
    console.error('AI Service Error:', error)
    throw error
  }
}