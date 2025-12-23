// app/components/TestAPI.tsx
import { useState } from 'react'

export default function TestAPI() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testAPI = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test')
      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setResult(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4">
      <button 
        onClick={testAPI}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? 'Testing...' : 'Test API'}
      </button>
      {result && (
        <pre className="mt-4 p-2 bg-gray-100 rounded">
          {result}
        </pre>
      )}
    </div>
  )
}