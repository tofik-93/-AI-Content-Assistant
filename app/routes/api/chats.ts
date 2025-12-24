import { createAPIFileRoute } from '@tanstack/react-router'
import { prisma } from '../../lib/db'

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
      
      return new Response(
        JSON.stringify({ chats }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' }
        }
      )
    } catch (error) {
      console.error('GET /api/chats error:', error)
      return new Response(
        JSON.stringify({ 
          chats: [],
          error: 'Failed to fetch chats'
        }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  },
  
  DELETE: async ({ request }) => {
    try {
      const url = new URL(request.url)
      const chatId = url.pathname.split('/').pop()
      
      if (!chatId) {
        return new Response(
          JSON.stringify({ error: 'Chat ID is required' }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
      
      await prisma.chat.delete({
        where: { id: chatId },
      })
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Chat ${chatId} deleted`
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    } catch (error) {
      console.error('DELETE /api/chats error:', error)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Failed to delete chat'
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  },
})