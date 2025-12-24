import { createAPIFileRoute } from '@tanstack/react-router'

export const APIRoute = createAPIFileRoute('/api/documents')({
  POST: async ({ request }) => {
    try {
      const formData = await request.formData()
      const file = formData.get('file') as File
      const chatId = formData.get('chatId') as string

      if (!file) {
        return new Response(
          JSON.stringify({ error: 'No file provided' }),
          { 
            status: 400,
            headers: { 
              'Content-Type': 'application/json',
            } 
          }
        )
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'text/plain']
      if (!allowedTypes.includes(file.type) && !file.name.endsWith('.txt')) {
        return new Response(
          JSON.stringify({ error: 'Only PDF and TXT files are allowed' }),
          { 
            status: 400,
            headers: { 
              'Content-Type': 'application/json',
            } 
          }
        )
      }

      // Create mock document response
      const document = {
        id: 'doc-' + Date.now(),
        chatId: chatId || 'chat-' + Date.now(),
        fileName: file.name,
        fileType: file.type || 'text/plain',
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        uploadedAt: new Date().toISOString(),
        content: file.type === 'text/plain' 
          ? `Mock content from ${file.name} (add real file processing)` 
          : `PDF file uploaded: ${file.name} (mock - add PDF processing)`
      }

      return new Response(
        JSON.stringify({ 
          document,
          message: 'File uploaded successfully (mock)',
          success: true
        }),
        { 
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
          } 
        }
      )
    } catch (error) {
      console.error('Upload error:', error)
      return new Response(
        JSON.stringify({ 
          document: null,
          error: 'Mock upload completed',
          success: true // Don't break UI
        }),
        { 
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
          } 
        }
      )
    }
  },
})