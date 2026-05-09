import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Layout } from './components/Layout.jsx'
import { LandingPage } from './pages/LandingPage.jsx'
import { UploadPage } from './pages/UploadPage.jsx'
import { ResultsPage } from './pages/ResultsPage.jsx'
import { NotFoundPage } from './pages/NotFoundPage.jsx'

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(24,24,27,0.92)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.10)',
          },
        }}
      />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </>
  )
}
