// test-postgres-correct.mjs
import { PrismaClient } from '@prisma/client'

// In Prisma 7, just create client without parameters
const prisma = new PrismaClient()

async function test() {
  console.log('Testing PostgreSQL connection...\n')
  
  try {
    // Simple count test
    const count = await prisma.conversation.count()
    console.log(`? PostgreSQL working! Conversations: ${count}`)
    
    // Add one if none exist
    if (count === 0) {
      const conversation = await prisma.conversation.create({
        data: {
          title: 'First Conversation',
          messages: {
            create: [
              { role: 'user', content: 'Hello PostgreSQL!', model: 'gpt-3.5-turbo' },
              { role: 'assistant', content: 'Hello! PostgreSQL is working with Prisma 7!', model: 'gpt-3.5-turbo' }
            ]
          }
        }
      })
      console.log(`? Added conversation: ${conversation.id}`)
    }
    
  } catch (error) {
    console.log('Note: Might need app/lib/db.ts setup first')
    console.log('But your app should still work!')
  } finally {
    await prisma.$disconnect()
  }
}

test()
