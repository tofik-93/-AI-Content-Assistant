// Test Gemini API connection
import { GoogleGenerativeAI } from '@google/generative-ai'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env.local
const envPath = join(__dirname, '.env.local')
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8')
  envContent.split(/\r?\n/).forEach(line => {
    line = line.trim()
    if (line && !line.startsWith('#')) {
      const match = line.match(/^([^=]+)=(.*)$/)
      if (match) {
        const key = match[1].trim()
        const value = match[2].trim()
        process.env[key] = value
        console.log(`Loaded: ${key} = ${value.substring(0, 10)}...`)
      }
    }
  })
} else {
  console.error('❌ .env.local file not found at:', envPath)
}

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY

if (!apiKey) {
  console.error('❌ GOOGLE_GENERATIVE_AI_API_KEY not found in .env.local')
  process.exit(1)
}

console.log('✅ API Key found:', apiKey.substring(0, 10) + '...')
console.log('🔍 Testing Gemini API connection...\n')

const genAI = new GoogleGenerativeAI(apiKey)

// First, try to list available models
console.log('📋 Fetching available models...')
try {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
  const data = await response.json()
  if (data.models) {
    console.log('\n✅ Available models:')
    data.models.forEach(model => {
      console.log(`   - ${model.name}`)
    })
    console.log('')
    
    // Extract model names (remove 'models/' prefix)
    const availableModels = data.models.map(m => m.name.replace('models/', ''))
    console.log('🧪 Testing available models...\n')
    
    // Try each available model
    for (const modelName of availableModels.slice(0, 5)) { // Test first 5 models
      try {
        console.log(`Testing model: ${modelName}...`)
        const geminiModel = genAI.getGenerativeModel({ model: modelName })
        const result = await geminiModel.generateContent('Say hello in one word')
        const response = await result.response
        const text = response.text()
        
        console.log(`✅ SUCCESS with ${modelName}!`)
        console.log(`   Response: ${text}\n`)
        console.log(`\n💡 Use this model name in your code: "${modelName}"`)
        process.exit(0)
      } catch (error) {
        console.log(`❌ ${modelName} failed: ${error.message}\n`)
      }
    }
  }
} catch (error) {
  console.log('⚠️  Could not list models, trying common names...\n')
}

// Try different model names
const modelsToTest = ['gemini-pro', 'gemini-1.5-flash', 'gemini-1.5-pro']

for (const modelName of modelsToTest) {
  try {
    console.log(`Testing model: ${modelName}...`)
    const geminiModel = genAI.getGenerativeModel({ model: modelName })
    const result = await geminiModel.generateContent('Say hello in one word')
    const response = await result.response
    const text = response.text()
    
    console.log(`✅ SUCCESS with ${modelName}!`)
    console.log(`   Response: ${text}\n`)
    console.log(`\n💡 Use this model name in your code: "${modelName}"`)
    process.exit(0)
  } catch (error) {
    console.log(`❌ ${modelName} failed: ${error.message}\n`)
  }
}

console.error('❌ All models failed. Please check your API key and try again.')
process.exit(1)

