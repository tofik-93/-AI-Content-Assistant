// Load environment variables from .env.local
// This ensures env vars are available in server-side code
import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function loadEnvFile() {
  const envPath = join(__dirname, '../../.env.local')
  
  if (existsSync(envPath)) {
    let envContent = readFileSync(envPath, 'utf-8')
    
    // Remove BOM (Byte Order Mark) if present
    if (envContent.charCodeAt(0) === 0xFEFF) {
      envContent = envContent.slice(1)
    }
    
    envContent.split(/\r?\n/).forEach(line => {
      line = line.trim()
      if (line && !line.startsWith('#')) {
        const match = line.match(/^([^=]+)=(.*)$/)
        if (match) {
          const key = match[1].trim()
          const value = match[2].trim()
          // Only set if not already set (don't override existing env vars)
          if (!process.env[key]) {
            process.env[key] = value
            console.log(`[load-env] Loaded: ${key} = ${value.substring(0, 10)}...`)
          }
        }
      }
    })
  } else {
    console.warn(`[load-env] .env.local not found at: ${envPath}`)
  }
}

// Load env vars immediately
loadEnvFile()

export { loadEnvFile }

