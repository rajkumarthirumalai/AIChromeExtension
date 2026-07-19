import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import OptionsApp from './options/OptionsApp.tsx'

createRoot(document.getElementById('options-root')!).render(
  <StrictMode>
    <OptionsApp />
  </StrictMode>,
)
