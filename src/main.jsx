import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { seedRaces } from '@/lib/seedData'

seedRaces()

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
