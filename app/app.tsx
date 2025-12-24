import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

// Import your routes
import { Route as IndexRoute } from './routes/index'

// Create QueryClient instance
const queryClient = new QueryClient()

// Create route tree - API routes are handled automatically by TanStack Router
// They don't need to be added to the client-side route tree
const routeTree = IndexRoute

// Create router
const router = createRouter({ 
  routeTree,
  context: {
    queryClient,
  },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </QueryClientProvider>
  )
}

const rootElement = document.getElementById('app')!
if (!rootElement.innerHTML) {
  createRoot(rootElement).render(<App />)
}