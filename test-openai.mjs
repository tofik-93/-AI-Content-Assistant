// test-openai.js
import { OpenAI } from 'openai'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function testOpenAI() {
  console.log('?? Testing OpenAI API Key...\n')
  
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  try {
    // Simple test request
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Say hello in one word' }],
      max_tokens: 5,
    })

    console.log('? OpenAI API Key is WORKING!')
    console.log(`Response: ${completion.choices[0].message.content}`)
    console.log(`Model: ${completion.choices[0].message.model}`)
    
  } catch (error) {
    console.log('? OpenAI API Error:', error.message)
    console.log('\n?? Possible fixes:')
    console.log('1. Check if key starts with sk-')
    console.log('2. Check if you have credit balance')
    console.log('3. Visit: https://platform.openai.com/usage')
  }
}

testOpenAI()
