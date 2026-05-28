'use client'

import { useState } from 'react'
import { Mail, Loader2, Wallet, CheckCircle, ArrowLeft } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'

interface LoginModalProps {
  open: boolean
  onClose: () => void
}

type Step = 'email' | 'otp' | 'loading' | 'done'

export function LoginModal({ open, onClose }: LoginModalProps) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<Step>('email')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const startCountdown = () => {
    setCountdown(60)
    const t = setInterval(() => {
      setCountdown(n => {
        if (n <= 1) { clearInterval(t); return 0 }
        return n - 1
      })
    }, 1000)
  }

  const handleSendCode = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }
    setError('')
    setSending(true)
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to send code'); return }
      setStep('otp')
      startCountdown()
    } catch {
      setError('Network error, please try again')
    } finally {
      setSending(false)
    }
  }

  const handleVerify = async () => {
    if (otp.length !== 6) { setError('Please enter the 6-digit code'); return }
    setError('')
    setStep('loading')
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Verification failed'); setStep('otp'); return }
      // Use login from useAuth to set user state
      await login(email, data)
      setStep('done')
      setTimeout(() => { handleClose() }, 1500)
    } catch {
      setError('Network error, please try again')
      setStep('otp')
    }
  }

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setStep('email')
      setEmail('')
      setOtp('')
      setError('')
      setCountdown(0)
    }, 300)
  }

  return (
    <Modal open={open} onClose={handleClose} title="Sign In / Register" className="max-w-sm">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <Wallet className="w-6 h-6 text-blue-400" />
        </div>
        <p className="text-gray-400 text-sm mt-1">Sign in with your email verification code</p>
      </div>

      {step === 'email' && (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                type="email"
                placeholder="your@email.com"
                className="pl-9"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendCode()}
                autoFocus
              />
            </div>
            {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
          </div>
          <Button className="w-full h-11" onClick={handleSendCode} disabled={sending}>
            {sending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Sending...</> : 'Send Code'}
          </Button>
        </div>
      )}

      {step === 'otp' && (
        <div className="space-y-4">
          <button
            onClick={() => { setStep('email'); setOtp(''); setError('') }}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors mb-1"
          >
            <ArrowLeft className="w-3 h-3" /> Change email
          </button>
          <div className="text-sm text-gray-400 bg-gray-800/60 rounded-lg px-3 py-2.5">
            Verification code sent to <span className="text-white font-medium">{email}</span>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Enter 6-digit code</label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="000000"
              maxLength={6}
              className="text-center text-2xl tracking-[0.5em] font-mono"
              value={otp}
              onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleVerify()}
              autoFocus
            />
            {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
          </div>
          <Button className="w-full h-11" onClick={handleVerify} disabled={otp.length !== 6}>
            Verify &amp; Sign In
          </Button>
          <button
            className="w-full text-sm text-gray-500 hover:text-gray-300 disabled:opacity-40 transition-colors"
            onClick={handleSendCode}
            disabled={countdown > 0 || sending}
          >
            {countdown > 0 ? `Resend (${countdown}s)` : 'Resend code'}
          </button>
        </div>
      )}

      {step === 'loading' && (
        <div className="py-10 text-center space-y-4">
          <Loader2 className="w-10 h-10 text-blue-400 animate-spin mx-auto" />
          <div>
            <p className="text-white font-medium">Signing in...</p>
            <p className="text-gray-500 text-sm mt-1">Setting up your smart wallet</p>
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="py-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
            <CheckCircle className="w-9 h-9 text-emerald-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-lg">Signed in successfully!</p>
            <p className="text-gray-500 text-sm mt-1">Your smart wallet is ready</p>
          </div>
        </div>
      )}
    </Modal>
  )
}
