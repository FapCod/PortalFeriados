import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { useGSAP } from '@gsap/react'
import './styles/variables.css'
import './styles/global.css'
import './index.css'
import App from './App.tsx'

// Registrar plugins de GSAP globalmente
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, useGSAP);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

