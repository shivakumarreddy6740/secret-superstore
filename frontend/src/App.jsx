import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'

import { supabase } from './lib/supabaseClient'

function App() {
  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
        <div className="bg-red-900/50 p-8 rounded-lg max-w-md text-center border border-red-500">
          <h1 className="text-2xl font-bold mb-4 text-red-200">Configuration Error</h1>
          <p className="mb-4">Missing Supabase environment variables.</p>
          <p className="text-sm text-gray-300">
            Please create a <code className="bg-gray-800 px-1 py-0.5 rounded">.env</code> file in the
            <code className="bg-gray-800 px-1 py-0.5 rounded ml-1">frontend</code> directory
            (or root if configured) with:
          </p>
          <pre className="mt-4 bg-gray-950 p-4 rounded text-left text-xs overflow-x-auto">
            VITE_SUPABASE_URL=your_url{'\n'}
            VITE_SUPABASE_ANON_KEY=your_key
          </pre>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}

export default App
