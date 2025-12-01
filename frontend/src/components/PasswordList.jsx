import { useEffect, useState } from 'react'

export default function PasswordList({ session, refreshTrigger }) {
    const [passwords, setPasswords] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [revealedId, setRevealedId] = useState(null)
    const [revealedPassword, setRevealedPassword] = useState(null)
    const [copyStatus, setCopyStatus] = useState(null)

    useEffect(() => {
        fetchPasswords()
    }, [refreshTrigger])

    const fetchPasswords = async () => {
        setLoading(true)
        try {
            const { access_token } = session
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

            const response = await fetch(`${backendUrl}/api/passwords`, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            })

            if (!response.ok) throw new Error('Failed to fetch passwords')

            const data = await response.json()
            setPasswords(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleReveal = async (id) => {
        try {
            const { access_token } = session
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

            const response = await fetch(`${backendUrl}/api/passwords/${id}/reveal`, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.detail || 'Failed to reveal password')
            }

            const data = await response.json()
            setRevealedId(id)
            setRevealedPassword(data.password)

            // Auto-hide after 10 seconds
            setTimeout(() => {
                if (revealedId === id) {
                    setRevealedId(null)
                    setRevealedPassword(null)
                }
            }, 10000)

        } catch (err) {
            alert(err.message)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this password?')) return

        try {
            const { access_token } = session
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

            const response = await fetch(`${backendUrl}/api/passwords/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            })

            if (!response.ok) throw new Error('Failed to delete password')

            fetchPasswords()
        } catch (err) {
            alert(err.message)
        }
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopyStatus('Copied!')
            setTimeout(() => setCopyStatus(null), 2000)
        })
    }

    if (loading && passwords.length === 0) return <div className="text-center text-gray-400">Loading passwords...</div>
    if (error) return <div className="text-center text-red-400">{error}</div>

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-emerald-400">Your Passwords</h3>

            {passwords.length === 0 ? (
                <p className="text-gray-400">No passwords saved yet.</p>
            ) : (
                <div className="space-y-4">
                    {passwords.map((pwd) => (
                        <div key={pwd.id} className="bg-gray-700 p-4 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h4 className="font-bold text-lg">{pwd.org_name}</h4>
                                <p className="text-xs text-gray-400">Added: {new Date(pwd.created_at).toLocaleDateString()}</p>
                                <div className="mt-2 font-mono bg-gray-900 px-2 py-1 rounded inline-block min-w-[200px]">
                                    {revealedId === pwd.id ? (
                                        <span className="text-emerald-300">{revealedPassword}</span>
                                    ) : (
                                        <span className="text-gray-500">••••••••••••••••</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {revealedId === pwd.id ? (
                                    <button
                                        onClick={() => copyToClipboard(revealedPassword)}
                                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                                    >
                                        {copyStatus || 'Copy'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleReveal(pwd.id)}
                                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 rounded text-sm transition-colors"
                                    >
                                        Reveal
                                    </button>
                                )}

                                <button
                                    onClick={() => handleDelete(pwd.id)}
                                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
