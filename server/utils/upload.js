const path = require('path')
const multer = require('multer')

const uploadsDir = path.join(__dirname, '..', 'uploads')

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const safe = String(file.originalname || 'upload.pdf')
      .replace(/[^\w.\-]+/g, '_')
      .slice(0, 120)
    const stamp = Date.now()
    cb(null, `${stamp}_${safe}`)
  },
})

function fileFilter(req, file, cb) {
  if (file.mimetype !== 'application/pdf') return cb(new Error('Only PDF uploads are allowed.'))
  cb(null, true)
}

const uploadPdf = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
    files: 1,
  },
})

module.exports = { uploadPdf }

