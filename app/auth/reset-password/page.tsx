'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState('')
  const [ready, setReady] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const hash = window.location.hash
    const params = new URLSearchParams(hash.slice(1))
    const access_token = params.get('access_token')
    const refresh_token = params.get('refresh_token')

    if (access_token && refresh_token) {
      supabase.auth.setSession({ access_token, refresh_token }).then(({ error }) => {
        if (error) setMsg('Invalid or expired reset link.')
        else setReady(true)
      })
    } else {
      setMsg('Invalid reset link.')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setMsg('Passwords do not match'); return }
    if (password.length < 6) { setMsg('Minimum 6 characters'); return }
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setMsg(error.message); return }
    setMsg('✓ Password updated! Redirecting...')
    setTimeout(() => router.push('/dashboard'), 1500)
  }

  return (
    <div className="min-h-screen bg-cyber-hero flex items-center justify-center px-4">
      <div className="glass p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Reset Password</h1>
        {!ready ? (
          <p className={`text-sm ${msg ? 'text-red-400' : 'text-white/50'}`}>{msg || 'Verifying reset link…'}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="password" placeholder="New password" required minLength={6}
              value={password} onChange={e => setPassword(e.target.value)} className="input-cyber" />
            <input type="password" placeholder="Confirm password" required
              value={confirm} onChange={e => setConfirm(e.target.value)} className="input-cyber" />
            {msg && <p className={`text-sm ${msg.startsWith('✓') ? 'text-neon-green' : 'text-red-400'}`}>{msg}</p>}
            <button type="submit" className="btn-neon w-full py-3">Update Password</button>
          </form>
        )}
      </div>
    </div>
  )
}
