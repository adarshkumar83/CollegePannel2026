import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Port 5174 so it can run next to Admin_College (5173)
export default defineConfig({
  plugins: [react()],
  server: { port: 5174 },
})
