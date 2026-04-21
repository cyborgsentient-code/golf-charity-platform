'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
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
    await supabase.auth.signOut()
    setMsg('✓ Password updated! Please sign in with your new password.')
    setTimeout(() => router.push('/auth/login'), 2000)
  }

  return (
    <div className="min-h-screen bg-cyber-hero flex items-center justify-center px-4">
      <div className="glass p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Reset Password</h1>
        {!ready ? (
          <p className={`text-sm ${msg ? 'text-red-400' : 'text-white/50'}`}>{msg || 'Verifying reset link…'}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} placeholder="New password" required minLength={6}
                value={password} onChange={e => setPassword(e.target.value)} className="input-cyber pr-12" />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs">
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
            <input type={showPw ? 'text' : 'password'} placeholder="Confirm password" required
              value={confirm} onChange={e => setConfirm(e.target.value)} className="input-cyber" />
            {msg && <p className={`text-sm ${msg.startsWith('✓') ? 'text-neon-green' : 'text-red-400'}`}>{msg}</p>}
            <button type="submit" className="btn-neon w-full py-3">Update Password</button>
          </form>
        )}
      </div>
    </div>
  )
}
