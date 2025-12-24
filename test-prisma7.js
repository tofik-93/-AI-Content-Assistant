// test-prisma7.js
const { PrismaClient } = require('@prisma/client')

// Create client with explicit URL
const prisma = new PrismaClient({
  datasourceUrl: 'file:./ai_assistant.db'
})

async function test() {
  console.log('?? Testing Prisma 7 with TanStack Start...\n')
  
  try {
    // Test connection
    console.log('1. Testing database connection...')
    await prisma.$connect()
    console.log('? Connected to SQLite database')
    
    // Create test data
    console.log('\n2. Creating test conversation...')
    const conversation = await prisma.conversation.create({
      data: {
        title: 'Prisma 7 Test',
        messages: {
          create: [
            { role: 'user', content: 'Testing Prisma 7 with TanStack Start', model: 'gpt-3.5-turbo' },
            { role: 'assistant', content: 'Everything is working correctly!', model: 'gpt-3.5-turbo' }
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
    
    console.log('\n?? Prisma 7 setup successful!')
    
  } catch (error) {
    console.error('? Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

test()
