import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import InkCursor from './components/InkCursor/InkCursor'
import profile from './data/profile'
import './index.css'

document.title = profile.pageTitle

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <InkCursor />
      <App />
    </BrowserRouter>
  </StrictMode>
)
