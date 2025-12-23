import { createAPIFileRoute } from '@tanstack/react-start/api'
import { PrismaClient } from '@prisma/client'

// Initialize Prisma client
const prisma = new PrismaClient()

export const APIRoute = createAPIFileRoute('/api/chats')({
  GET: async () => {
    try {
      const chats = await prisma.chat.findMany({
        orderBy: { updatedAt: 'desc' },
        include: {
          messages: {
            orderBy: { timestamp: 'desc' },
            take: 1,
          },
        },
      })
      
      return Response.json({ chats })
    } catch (error) {
      console.error('GET /api/chats error:', error)
      return new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to fetch chats' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    } finally {
      // Optional: Close connection if needed
      // await prisma.$disconnect()
    }
  },
  
  DELETE: async ({ request }) => {
    try {
      const url = new URL(request.url)
      const chatId = url.pathname.split('/').pop()
      
      if (!chatId) {
        return new Response(
          JSON.stringify({ error: 'Chat ID is required' }),
          { status: 400 }
        )
      }
      
      await prisma.chat.delete({
        where: { id: chatId },
      })
      
      return Response.json({ success: true })
    } catch (error) {
      console.error('DELETE /api/chats error:', error)
      return new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to delete chat' }),
        { status: 500 }
      )
    }
  },
})