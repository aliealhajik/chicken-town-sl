import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Chicken Town SL | SWIT U MOT SWIT U LYF',
  description: "Freetown's favourite chicken restaurant. Order online.",
  openGraph: {
    title: 'Chicken Town SL',
    description: 'SWIT U MOT SWIT U LYF',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-off-white text-charcoal antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}

