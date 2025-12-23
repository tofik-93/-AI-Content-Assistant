import { createAPIFileRoute } from '@tanstack/react-router'
import { prisma } from '../lib/prisma'

export const APIRoute = createAPIFileRoute('/api/documents')({
  POST: async ({ request }) => {
    try {
      const formData = await request.formData()
      const file = formData.get('file') as File
      const chatId = formData.get('chatId') as string

      if (!file) {
        return new Response(
          JSON.stringify({ error: 'No file provided' }),
          { status: 400 }
        )
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'text/plain']
      if (!allowedTypes.includes(file.type)) {
        return new Response(
          JSON.stringify({ error: 'Only PDF and TXT files are allowed' }),
          { status: 400 }
        )
      }

      // Read file content (simplified)
      let content = ''
      if (file.type === 'text/plain') {
        content = await file.text()
      } else {
        content = `PDF file uploaded: ${file.name}`
      }

      // Create or get chat
      let chat = chatId 
        ? await prisma.chat.findUnique({ where: { id: chatId } })
        : await prisma.chat.create({
            data: {
              title: 'Document Analysis',
              model: 'gpt-3.5-turbo',
            },
          })

      // Save to database
      const document = await prisma.document.create({
        data: {
          chatId: chat.id,
          fileName: file.name,
          fileType: file.type,
          fileSize: `${(file.size / 1024).toFixed(1)} KB`,
          content,
        },
      })

      return Response.json({ document, chatId: chat.id })
    } catch (error) {
      console.error('Upload error:', error)
      return new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to upload document' }),
        { status: 500 }
      )
    }
  },
})