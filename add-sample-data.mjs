// add-sample-data.mjs
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addSample() {
  try {
    console.log('Adding sample conversation to PostgreSQL...')
    
    const conversation = await prisma.conversation.create({
      data: {
        title: 'Welcome to AI Assistant',
        messages: {
          create: [
            { 
              role: 'user', 
              content: 'Hello! Is PostgreSQL working with our AI Assistant?', 
              model: 'gpt-3.5-turbo' 
            },
            { 
              role: 'assistant', 
              content: 'Yes! PostgreSQL is fully set up and ready. Your chat history will be saved automatically.', 
              model: 'gpt-3.5-turbo' 
            }
          ]
        }
      }
    })
    
    console.log(`? Sample conversation added: ${conversation.id}`)
    console.log(`?? Total conversations: ${await prisma.conversation.count()}`)
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

addSample()
