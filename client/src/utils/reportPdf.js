import { jsPDF } from 'jspdf'

function safeText(s) {
  return String(s || '').replace(/\s+/g, ' ').trim()
}

export async function generatePdfReport(result) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const margin = 42
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const maxW = pageW - margin * 2

  const title = 'AI Fact-Check Report'
  const fileName = safeText(result?.file?.originalName) || 'Uploaded PDF'

  let y = margin
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text(title, margin, y)
  y += 18
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(140)
  doc.text(`PDF: ${fileName}`, margin, y)
  y += 18
  doc.setTextColor(0)

  const verifications = Array.isArray(result?.verifications) ? result.verifications : []

  const wrap = (text) => doc.splitTextToSize(safeText(text), maxW)
  const addBlock = (label, text) => {
    if (!text) return
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text(label, margin, y)
    y += 14
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    const lines = wrap(text)
    for (const line of lines) {
      if (y > pageH - margin) {
        doc.addPage()
        y = margin
      }
      doc.text(line, margin, y)
      y += 14
    }
    y += 8
  }

  doc.setDrawColor(230)
  doc.setLineWidth(1)
  doc.line(margin, y, pageW - margin, y)
  y += 18

  verifications.forEach((v, idx) => {
    if (y > pageH - margin - 120) {
      doc.addPage()
      y = margin
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text(`#${idx + 1} — ${String(v?.verdict || 'UNKNOWN').toUpperCase()} (${Math.round(Number(v?.confidence || 0))}%)`, margin, y)
    y += 16

    addBlock('Claim', v?.claim)
    addBlock('Corrected fact', v?.corrected_fact)
    addBlock('Reasoning', v?.reasoning)

    const sources = Array.isArray(v?.sources) ? v.sources : []
    if (sources.length) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('Sources', margin, y)
      y += 14
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      for (const s of sources.slice(0, 6)) {
        const line = `- ${safeText(s?.title || '')} ${safeText(s?.url || '')}`
        const lines = doc.splitTextToSize(line, maxW)
        for (const l of lines) {
          if (y > pageH - margin) {
            doc.addPage()
            y = margin
          }
          doc.text(l, margin, y)
          y += 13
        }
      }
      y += 10
    }

    doc.setDrawColor(230)
    doc.line(margin, y, pageW - margin, y)
    y += 18
  })

  const outName = `fact-check-report-${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(outName)
}

