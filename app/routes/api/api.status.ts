import { createFileRoute } from '@tanstack/react-router'
import '../../lib/load-env' // Ensure env vars are loaded
import { checkAPIKeys } from '../../lib/ai-services'

export const APIRoute = createFileRoute('/api/status')({
  GET: async () => {
    // This runs on server-side where process.env is available
    const apiKeys = checkAPIKeys()
    const hasOpenAIKey = apiKeys.openai
    const hasGeminiKey = apiKeys.gemini
    const hasAnyKey = hasOpenAIKey || hasGeminiKey
    
    // Debug info
    const geminiKeyPreview = process.env.GOOGLE_GENERATIVE_AI_API_KEY 
      ? `${process.env.GOOGLE_GENERATIVE_AI_API_KEY.substring(0, 10)}...` 
      : 'NOT SET'
    
    return new Response(
      JSON.stringify({
        mode: hasAnyKey ? 'production' : 'development',
        apiKeys: {
          openai: hasOpenAIKey,
          gemini: hasGeminiKey,
          geminiKeyPreview: geminiKeyPreview
        },
        timestamp: new Date().toISOString(),
        message: hasAnyKey 
          ? 'API keys configured. Real AI services are available.'
          : 'No API keys found. Please configure OPENAI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY in .env.local'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})