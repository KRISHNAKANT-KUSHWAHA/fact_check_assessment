const express = require('express')
const { uploadPdf } = require('../utils/upload')
const {
  uploadController,
  extractClaimsController,
  verifyController,
} = require('../controllers/factcheckController')

const factcheckRouter = express.Router()

factcheckRouter.post('/upload', uploadPdf.single('pdf'), uploadController)
factcheckRouter.post('/extract-claims', extractClaimsController)
factcheckRouter.post('/verify', verifyController)

module.exports = { factcheckRouter }

