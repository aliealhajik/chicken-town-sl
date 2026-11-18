import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

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
      <body className="font-sans bg-off-white text-charcoal antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}

