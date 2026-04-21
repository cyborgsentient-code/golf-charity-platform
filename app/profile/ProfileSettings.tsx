'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Profile } from '@/lib/types'

export default function ProfileSettings({ profile, email }: { profile: Profile | null; email: string }) {
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [country, setCountry] = useState((profile as any)?.country || 'US')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nameLoading, setNameLoading] = useState(false)
  const [passLoading, setPassLoading] = useState(false)
  const [nameMsg, setNameMsg] = useState('')
  const [passMsg, setPassMsg] = useState('')
  const router = useRouter()

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault()
    setNameLoading(true)
    setNameMsg('')
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName, country }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setNameMsg('✓ Name updated successfully')
      router.refresh()
    } catch (err: any) {
      setNameMsg(err.message)
    } finally {
      setNameLoading(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) { setPassMsg('Passwords do not match'); return }
    if (newPassword.length < 6) { setPassMsg('Password must be at least 6 characters'); return }
    setPassLoading(true)
    setPassMsg('')
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setPassMsg('✓ Password updated successfully')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setPassMsg(err.message)
    } finally {
      setPassLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Account Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Account Information</h2>
        <div className="mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
          <p className="font-medium">{email}</p>
        </div>
        <div className="mb-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">Subscription Status</p>
          <p className="font-medium capitalize">{profile?.subscription_status || 'inactive'}</p>
        </div>
        {profile?.subscription_end_date && (
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Renewal Date</p>
            <p className="font-medium">{new Date(profile.subscription_end_date).toLocaleDateString()}</p>
          </div>
        )}
      </div>

      {/* Update Name */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Update Name</h2>
        <form onSubmit={handleUpdateName} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <select value={country} onChange={e => setCountry(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
              {[['US','United States'],['GB','United Kingdom'],['IE','Ireland'],['AU','Australia'],['CA','Canada'],['ZA','South Africa'],['NZ','New Zealand'],['IN','India']].map(([code, label]) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>
          </div>
          {nameMsg && <p className={`text-sm ${nameMsg.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>{nameMsg}</p>}
          <button type="submit" disabled={nameLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition">
            {nameLoading ? 'Saving...' : 'Save Name'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          {passMsg && <p className={`text-sm ${passMsg.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>{passMsg}</p>}
          <button type="submit" disabled={passLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition">
            {passLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
