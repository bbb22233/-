import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CryptoPredict — 加密货币预测市场',
  description: '预测加密货币市场走势，赢取收益',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body className={`${inter.className} bg-gray-950 text-white min-h-screen`}>
        <Header />
        <main className="pt-16">
          {children}
        </main>
      </body>
    </html>
  )
}
