import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Database helper functions
export async function createChat(title: string, model: string) {
  return await prisma.chat.create({
    data: { title, model }
  })
}

export async function saveMessage(chatId: string, role: string, content: string) {
  return await prisma.message.create({
    data: { chatId, role, content }
  })
}

export async function getChatMessages(chatId: string) {
  return await prisma.message.findMany({
    where: { chatId },
    orderBy: { timestamp: 'asc' }
  })
}

export async function getAllChats() {
  return await prisma.chat.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      messages: {
        orderBy: { timestamp: 'desc' },
        take: 1,
      },
    },
  })
}