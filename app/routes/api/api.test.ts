import { createAPIFileRoute } from '@tanstack/react-router'

export const APIRoute = createAPIFileRoute('/api/test')({
  GET: async () => {
    return new Response(
      JSON.stringify({ 
        message: 'API is working!',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      }
    )
  },
})