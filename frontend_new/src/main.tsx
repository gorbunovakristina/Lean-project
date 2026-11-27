import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './app/App'
import { appTheme } from './app/theme'
import './index.css'
import '@fontsource/hind-siliguri/400.css'
import '@fontsource/hind-siliguri/500.css'

const queryClient = new QueryClient()

async function enableMocking() {
  if (import.meta.env.VITE_USE_MOCKS !== 'true') return
  const { worker } = await import('./mocks/browser')
  await worker.start()
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider theme={appTheme}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ConfigProvider>
      </QueryClientProvider>
    </StrictMode>,
  )
})