import { createFileRoute } from '@tanstack/react-router'
import ChatInterface from '../../app/components/chat/ChatInterface'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return <ChatInterface />
}