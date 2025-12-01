import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AddPasswordForm({ session, onPasswordAdded }) {
    const [orgName, setOrgName] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { access_token } = session
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
            console.log('Attempting to connect to:', backendUrl)

            const response = await fetch(`${backendUrl}/api/passwords`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access_token}`
                },
                body: JSON.stringify({
                    org_name: orgName,
                    password: password
                })
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.detail || 'Failed to add password')
            }

            setOrgName('')
            setPassword('')
            onPasswordAdded()
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-emerald-400">Add Password</h3>
            {error && <div className="bg-red-500/20 text-red-300 p-2 rounded mb-4 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Organization / Site</label>
                    <input
                        type="text"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-emerald-500 focus:outline-none"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-emerald-500 focus:outline-none"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 rounded font-bold transition-colors disabled:opacity-50"
                >
                    {loading ? 'Encrypting & Saving...' : 'Save Password'}
                </button>
            </form>
        </div>
    )
}
