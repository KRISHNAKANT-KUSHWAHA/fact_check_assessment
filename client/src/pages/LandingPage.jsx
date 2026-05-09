import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, FileUp, ShieldCheck, Sparkles, Webhook } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

function Feature({ icon: Icon, title, desc }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/10 grid place-items-center">
          <Icon className="h-5 w-5 text-sky-200" />
        </div>
        <div>
          <div className="font-semibold text-white">{title}</div>
          <div className="mt-1 text-sm text-zinc-300 leading-relaxed">{desc}</div>
        </div>
      </div>
    </div>
  )
}

export function LandingPage() {
  return (
    <div className="pt-4 sm:pt-8">
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-10 items-start">
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 glass text-xs text-zinc-200">
            <Sparkles className="h-4 w-4 text-violet-200" />
            Gemini-powered claim extraction + verification
          </motion.div>

          <motion.h1 variants={fadeUp} className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight text-white">
            Fact-check PDFs with <span className="text-gradient">live web evidence</span>.
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-4 text-zinc-300 leading-relaxed">
            Upload a report, pitch deck, or research PDF. We extract high-signal factual claims, search the web,
            and produce a professional audit with VERIFIED / INACCURATE / FALSE verdicts, corrected facts, and sources.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              to="/upload"
              className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold bg-white text-zinc-900 hover:bg-zinc-100 transition"
            >
              Upload a PDF <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <a
              href="#how"
              className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold glass text-white hover:bg-white/10 transition"
            >
              How it works
            </a>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-6 text-xs text-zinc-400">
            Tip: Best results on data-heavy PDFs (numbers, dates, statistics).
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-strong rounded-3xl p-6"
        >
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-white">What you get</div>
            <div className="text-xs text-zinc-300">Export JSON + PDF</div>
          </div>

          <div className="mt-5 grid gap-4">
            <div className="rounded-2xl bg-black/30 border border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-zinc-400">Accuracy Score</div>
                <div className="text-xs text-zinc-400">Claims</div>
              </div>
              <div className="mt-2 flex items-end justify-between">
                <div className="text-3xl font-bold text-white">92%</div>
                <div className="text-xl font-semibold text-zinc-200">18</div>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-[92%] bg-gradient-to-r from-teal-300 via-sky-300 to-violet-300" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-400/20 p-3">
                <div className="text-[11px] text-emerald-200/90">VERIFIED</div>
                <div className="mt-1 text-xl font-bold text-white">11</div>
              </div>
              <div className="rounded-2xl bg-amber-500/10 border border-amber-300/20 p-3">
                <div className="text-[11px] text-amber-200/90">INACCURATE</div>
                <div className="mt-1 text-xl font-bold text-white">5</div>
              </div>
              <div className="rounded-2xl bg-rose-500/10 border border-rose-300/20 p-3">
                <div className="text-[11px] text-rose-200/90">FALSE</div>
                <div className="mt-1 text-xl font-bold text-white">2</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div id="how" className="mt-10 sm:mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Feature icon={FileUp} title="Upload & extract text" desc="Secure PDF upload, page-wise extraction, and smart cleanup." />
        <Feature icon={Webhook} title="Search the live web" desc="Tavily pulls authoritative sources to ground the verification." />
        <Feature icon={ShieldCheck} title="Verdicts & corrections" desc="Gemini classifies and produces corrected facts with citations." />
      </div>
    </div>
  )
}

