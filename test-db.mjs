// test-db.mjs (ES Module)
import { PrismaClient } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

async function test() {
  console.log('?? Testing Prisma 7 Database...\n')
  
  // Create Prisma client WITHOUT datasourceUrl
  // In Prisma 7, the URL comes from prisma.config.ts
  const prisma = new PrismaClient()
  
  try {
    // Test connection
    console.log('1. Testing database connection...')
    await prisma.$connect()
    console.log('? Connected to SQLite database')
    
    // Create test data
    console.log('\n2. Creating test conversation...')
    const conversation = await prisma.conversation.create({
      data: {
        title: 'First AI Conversation',
        messages: {
          create: [
            { role: 'user', content: 'Hello AI! Is the database working?', model: 'gpt-3.5-turbo' },
            { role: 'assistant', content: 'Yes! Your SQLite database with Prisma 7 is working perfectly!', model: 'gpt-3.5-turbo' }
          ]
        }
      }
    })
    console.log('? Created conversation:', conversation.id)
    
    // Count data
    const count = await prisma.conversation.count()
    console.log(`\n3. Total conversations: ${count}`)
    
    // List tables
    console.log('\n4. Database tables:')
    const tables = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table'`
    tables.forEach(table => console.log(`   - ${table.name}`))
    
    console.log('\n?? Database setup complete! Ready for AI Assistant.')
    
  } catch (error) {
    console.error('? Error:', error.message)
    if (error instanceof PrismaClientKnownRequestError) {
      console.error('Prisma Error Code:', error.code)
    }
  } finally {
    await prisma.$disconnect()
  }
}

test()
