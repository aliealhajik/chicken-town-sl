import Link from 'next/link'

export const runtime = 'edge'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center p-6 text-white text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-red flex items-center justify-center text-3xl mb-4">
        🍗
      </div>
      <h2 className="text-3xl font-black mb-2">404 - Page Not Found</h2>
      <p className="text-gray-400 mb-6 max-w-sm">
        We couldn&apos;t find the page you were looking for at Chicken Town SL.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-xl bg-brand-red text-white font-bold hover:bg-brand-red/90 transition-colors"
      >
        Return to Home
      </Link>
    </div>
  )
}
