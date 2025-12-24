import { createAPIFileRoute } from '@tanstack/react-router'
import '../../lib/load-env' // Ensure env vars are loaded
import { prisma, saveMessage } from '../../lib/db'
import { generateAIResponse } from '../../lib/ai-services'

export const APIRoute = createAPIFileRoute('/api/chat')({
  POST: async ({ request }) => {
    try {
      const { model, messages, chatId } = await request.json()

      if (!model || !messages) {
        return new Response(
          JSON.stringify({ error: 'Model and messages are required' }),
          { 
            status: 400, 
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }

      // Get or create chat
      let chat = chatId 
        ? await prisma.chat.findUnique({ where: { id: chatId } })
        : null
        
      if (!chat) {
        const lastMessage = messages[messages.length - 1]?.content || 'New Chat'
        const title = lastMessage.substring(0, 50) + (lastMessage.length > 50 ? '...' : '')
        
        chat = await prisma.chat.create({
          data: {
            title,
            model,
          },
        })
      }

      // Save user message
      const lastUserMessage = messages[messages.length - 1]
      if (lastUserMessage.role === 'user') {
        await saveMessage(chat.id, 'user', lastUserMessage.content)
      }

      // Get AI response
      const aiResponse = await generateAIResponse(model, messages)
      
      // Save AI response
      await saveMessage(chat.id, 'assistant', aiResponse)

      // Update chat timestamp
      await prisma.chat.update({
        where: { id: chat.id },
        data: { updatedAt: new Date() }
      })

      return new Response(
        JSON.stringify({ 
          content: aiResponse,
          model,
          chatId: chat.id,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' }
        }
      )
      
    } catch (error) {
      console.error('API Error:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown',
        stack: error instanceof Error ? error.stack : undefined
      })
      
      // Check if it's an API key error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const isAPIKeyError = errorMessage.includes('API_KEY') || errorMessage.includes('not set')
      
      // Check environment variables
      console.log('Environment check:', {
        hasGeminiKey: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
        geminiKeyPreview: process.env.GOOGLE_GENERATIVE_AI_API_KEY?.substring(0, 10) + '...' || 'NOT SET'
      })
      
      return new Response(
        JSON.stringify({ 
          error: isAPIKeyError ? 'API Key Error' : 'AI API Error',
          message: errorMessage,
          details: isAPIKeyError 
            ? 'Please check your .env.local file and ensure API keys are properly configured. Make sure to restart your dev server after adding the keys.'
            : 'The AI service encountered an error. Please try again or check your API keys.'
        }),
        { 
          status: isAPIKeyError ? 401 : 500, 
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  },
})