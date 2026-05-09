import { Link, NavLink, useLocation } from 'react-router-dom'
import { BadgeCheck, FileSearch2 } from 'lucide-react'

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'text-sm font-medium transition',
          isActive ? 'text-white' : 'text-zinc-300 hover:text-white',
        ].join(' ')
      }
    >
      {children}
    </NavLink>
  )
}

export function Navbar() {
  const location = useLocation()
  const onLanding = location.pathname === '/'

  return (
    <header className="pt-6">
      <div className="glass rounded-2xl px-4 py-3 sm:px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-white/10 border border-white/10 grid place-items-center">
            <FileSearch2 className="h-5 w-5 text-sky-200" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-white">AI Fact-Check Agent</div>
            <div className="text-[12px] text-zinc-300">PDF → claims → web verification</div>
          </div>
        </Link>

        <nav className="hidden sm:flex items-center gap-6">
          <NavItem to="/">Home</NavItem>
          <NavItem to="/upload">Upload</NavItem>
          <NavItem to="/results">Results</NavItem>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-[12px] text-zinc-300">
            <BadgeCheck className="h-4 w-4 text-teal-200" />
            <span>Production-ready pipeline</span>
          </div>
          <Link
            to="/upload"
            className={[
              'inline-flex items-center justify-center rounded-xl px-3.5 py-2 text-sm font-semibold',
              'bg-white text-zinc-900 hover:bg-zinc-100 transition',
              onLanding ? '' : 'hidden sm:inline-flex',
            ].join(' ')}
          >
            Start
          </Link>
        </div>
      </div>
    </header>
  )
}

