import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar.jsx'
import { Footer } from './Footer.jsx'

export function Layout() {
  return (
    <div className="min-h-screen grid-bg">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Navbar />
        <main className="py-8 sm:py-10">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}

