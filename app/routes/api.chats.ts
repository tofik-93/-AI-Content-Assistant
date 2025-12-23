import { createAPIFileRoute } from '@tanstack/react-router'

export const APIRoute = createAPIFileRoute('/api/chat')({
  POST: async ({ request }) => {
    try {
      const { model, messages } = await request.json()

      if (!model || !messages) {
        return new Response(
          JSON.stringify({ error: 'Model and messages are required' }),
          { 
            status: 400, 
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            } 
          }
        )
      }

      // Simple response for testing - remove streaming for now
      const lastMessage = messages[messages.length - 1]?.content || ''
      const responseText = `This is a test response from ${model}. You said: "${lastMessage}"`
      
      return new Response(
        JSON.stringify({ 
          content: responseText,
          model: model
        }),
        { 
          status: 200, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          } 
        }
      )
      
    } catch (error) {
      console.error('API Error:', error)
      return new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
        { 
          status: 500, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          } 
        }
      )
    }
  },
})