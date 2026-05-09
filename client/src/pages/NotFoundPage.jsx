import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="max-w-2xl mx-auto glass rounded-3xl p-6">
      <div className="text-white font-semibold text-lg">404 — Not Found</div>
      <div className="mt-2 text-sm text-zinc-300">
        The page you’re looking for doesn’t exist.
      </div>
      <div className="mt-5">
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-2xl px-4 py-2 bg-white text-zinc-900 font-semibold hover:bg-zinc-100 transition"
        >
          Back home
        </Link>
      </div>
    </div>
  )
}

