import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import AddPasswordForm from '../components/AddPasswordForm'
import PasswordList from '../components/PasswordList'

export default function Dashboard() {
    const [session, setSession] = useState(null)
    const navigate = useNavigate()
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            if (!session) navigate('/')
        })

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            if (!session) navigate('/')
        })

        return () => subscription.unsubscribe()
    }, [navigate])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/')
    }

    const refreshList = () => {
        setRefreshTrigger(prev => prev + 1)
    }

    if (!session) return null

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-8 py-4 border-b border-gray-700">
                    <h1 className="text-2xl font-bold text-emerald-400">Secret Superstore Dashboard</h1>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                    >
                        Logout
                    </button>
                </header>

                <div className="grid gap-8 md:grid-cols-3">
                    <div className="md:col-span-1">
                        <AddPasswordForm session={session} onPasswordAdded={refreshList} />
                    </div>
                    <div className="md:col-span-2">
                        <PasswordList session={session} refreshTrigger={refreshTrigger} />
                    </div>
                </div>
            </div>
        </div>
    )
}
