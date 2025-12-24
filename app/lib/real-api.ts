import { OpenAI } from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)

export async function getAIResponse(model: string, messages: any[]) {
  try {
    switch (model) {
      case 'gpt-3.5-turbo':
      case 'gpt-4':
        const completion = await openai.chat.completions.create({
          model,
          messages,
          stream: true,
        })
        return completion
        
      case 'gemini-pro':
        const geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' })
        const lastMessage = messages[messages.length - 1]?.content || ''
        const result = await geminiModel.generateContent(lastMessage)
        return result.response.text()
        
      default:
        throw new Error(`Unsupported model: ${model}`)
    }
  } catch (error) {
    console.error('AI API Error:', error)
    throw error
  }
}