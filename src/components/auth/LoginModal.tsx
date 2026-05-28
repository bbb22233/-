'use client'

import { useState } from 'react'
import { Mail, Loader2, Wallet, CheckCircle } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'

interface LoginModalProps {
  open: boolean
  onClose: () => void
}

type Step = 'email' | 'otp' | 'creating' | 'done'

export function LoginModal({ open, onClose }: LoginModalProps) {
  const { login, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<Step>('email')
  const [error, setError] = useState('')

  const handleSendOtp = async () => {
    if (!email || !email.includes('@')) {
      setError('请输入有效的邮箱地址')
      return
    }
    setError('')
    setStep('otp')
  }

  const handleVerifyOtp = async () => {
    if (otp.length < 4) {
      setError('请输入验证码')
      return
    }
    setError('')
    setStep('creating')
    await login(email)
    setStep('done')
    setTimeout(() => {
      onClose()
      setStep('email')
      setEmail('')
      setOtp('')
    }, 1500)
  }

  const handleClose = () => {
    onClose()
    setStep('email')
    setEmail('')
    setOtp('')
    setError('')
  }

  return (
    <Modal open={open} onClose={handleClose} className="max-w-sm">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <Wallet className="w-6 h-6 text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-white">登录 / 注册</h2>
        <p className="text-gray-400 text-sm mt-1">使用邮箱登录，自动生成智能钱包</p>
      </div>

      {step === 'email' && (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">邮箱地址</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                type="email"
                placeholder="your@email.com"
                className="pl-9"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
              />
            </div>
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
          </div>
          <Button className="w-full" onClick={handleSendOtp}>
            发送验证码
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-800" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-gray-950 px-2 text-gray-500">或使用社交账号</span></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="w-full text-sm" onClick={() => login('google@demo.com')}>
              Google 登录
            </Button>
            <Button variant="outline" className="w-full text-sm" onClick={() => login('twitter@demo.com')}>
              Twitter 登录
            </Button>
          </div>
        </div>
      )}

      {step === 'otp' && (
        <div className="space-y-4">
          <div className="text-center text-sm text-gray-400 mb-2">
            验证码已发送至 <span className="text-white">{email}</span>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">输入验证码</label>
            <Input
              type="text"
              placeholder="000000"
              maxLength={6}
              className="text-center text-2xl tracking-widest"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
            />
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
          </div>
          <Button className="w-full" onClick={handleVerifyOtp} disabled={isLoading}>
            验证并登录
          </Button>
          <button className="w-full text-sm text-gray-500 hover:text-gray-300" onClick={() => setStep('email')}>
            重新发送
          </button>
        </div>
      )}

      {step === 'creating' && (
        <div className="py-8 text-center space-y-4">
          <Loader2 className="w-10 h-10 text-blue-400 animate-spin mx-auto" />
          <div>
            <p className="text-white font-medium">正在生成智能钱包</p>
            <p className="text-gray-400 text-sm mt-1">基于 ERC-4337 标准，无需助记词</p>
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="py-8 text-center space-y-4">
          <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
          <div>
            <p className="text-white font-medium">登录成功！</p>
            <p className="text-gray-400 text-sm mt-1">智能钱包已就绪</p>
          </div>
        </div>
      )}
    </Modal>
  )
}
