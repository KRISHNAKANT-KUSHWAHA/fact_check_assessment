export function Footer() {
  return (
    <footer className="pb-10 pt-8 text-center text-xs text-zinc-400">
      <div className="glass rounded-2xl px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            {/* Built with React, Tailwind, openrouu, Tavily, Express. */}
          </div>
          <div className="text-zinc-500">
            © {new Date().getFullYear()} AI Fact-Check Agent
          </div>
        </div>
      </div>
    </footer>
  )
}

