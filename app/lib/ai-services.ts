import { OpenAI } from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import './load-env' // Ensure env vars are loaded

// Initialize clients with validation
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set in environment variables. Please add it to your .env.local file.')
  }
  if (!apiKey.startsWith('sk-')) {
    throw new Error('Invalid OpenAI API key format. Keys should start with "sk-"')
  }
  return new OpenAI({ apiKey })
}

function getGeminiClient() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not set in environment variables. Please add it to your .env.local file.')
  }
  return new GoogleGenerativeAI(apiKey)
}

export async function generateAIResponse(
  model: string,
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  try {
    switch (model) {
      case 'gpt-3.5-turbo':
      case 'gpt-4':
        return await generateOpenAIResponse(model, messages)
        
      case 'gemini-pro':
      case 'gemini-1.5-flash':
      case 'gemini-1.5-pro':
      case 'gemini-2.5-flash':
      case 'gemini-2.5-pro':
        return await generateGeminiResponse(messages)
        
      default:
        throw new Error(`Unsupported model: ${model}. Supported models: gpt-3.5-turbo, gpt-4, gemini-pro (using gemini-2.5-flash)`)
    }
  } catch (error) {
    console.error('AI Service Error:', error)
    
    // Re-throw the error with a clear message instead of falling back to mock
    if (error instanceof Error) {
      throw new Error(`AI API Error: ${error.message}`)
    }
    throw new Error('Unknown error occurred while calling AI API')
  }
}

async function generateOpenAIResponse(
  model: string,
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  const openai = getOpenAIClient()
  
  const response = await openai.chat.completions.create({
    model,
    messages: messages.map(m => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content
    })),
    max_tokens: 2000,
    temperature: 0.7,
  })
  
  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('OpenAI API returned empty response')
  }
  
  return content
}

async function generateGeminiResponse(
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  try {
    const genAI = getGeminiClient()
    
    // Check API key is loaded
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
    console.log('Gemini API Key loaded:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND')
    
    // Use 'gemini-2.5-flash' - this is the current available model
    // gemini-pro and gemini-1.5-flash are deprecated
    const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    
    // Get the last user message
    const lastUserMessage = messages[messages.length - 1]
    if (!lastUserMessage || lastUserMessage.role !== 'user') {
      throw new Error('No valid user message provided')
    }
    
    console.log('Calling Gemini API with model: gemini-2.5-flash')
    
    // Format conversation history for Gemini
    // Build history from previous messages (excluding the last one)
    const history = messages
      .slice(0, -1)
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }))
    
    // Use chat API if we have history, otherwise use simple generateContent
    if (history.length > 0) {
      console.log('Using chat API with history')
      const chat = geminiModel.startChat({ history })
      const result = await chat.sendMessage(lastUserMessage.content)
      const response = await result.response
      const text = response.text()
      
      if (!text) {
        throw new Error('Gemini API returned empty response')
      }
      
      return text
    } else {
      // No history, use simple generateContent
      console.log('Using generateContent API')
      const result = await geminiModel.generateContent(lastUserMessage.content)
      const response = await result.response
      const text = response.text()
      
      if (!text) {
        throw new Error('Gemini API returned empty response')
      }
      
      return text
    }
  } catch (error: any) {
    console.error('Gemini API Error Details:', {
      message: error?.message,
      status: error?.status,
      statusText: error?.statusText,
      response: error?.response?.data,
      stack: error?.stack
    })
    
    // Provide more specific error messages
    if (error?.status === 404 || error?.message?.includes('404')) {
      throw new Error(`Gemini model not found (404). Please check: 1) Your API key is correct, 2) The model 'gemini-2.5-flash' is available in your region, 3) Your API key has access to Gemini models. Error: ${error?.message || 'Unknown error'}`)
    }
    if (error?.status === 400) {
      throw new Error(`Invalid Gemini API request (400). Check your API key and request format. Error: ${error?.message || 'Unknown error'}`)
    }
    if (error?.status === 403) {
      throw new Error(`Gemini API access forbidden (403). Check your API key permissions. Error: ${error?.message || 'Unknown error'}`)
    }
    
    throw error
  }
}

// Helper function to check if API keys are configured
export function checkAPIKeys(): { openai: boolean; gemini: boolean } {
  return {
    openai: !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-'),
    gemini: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY
  }
}