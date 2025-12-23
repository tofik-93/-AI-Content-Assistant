import { createFileRoute } from '@tanstack/react-router'
import ChatInterface from '@components/chat/ChatInterface'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ChatInterface />
    </div>
  )
}