# AI Fact-Check Agent

Production-grade AI-powered fact-checking web app for PDFs:
1) extracts factual claims, 2) searches live web evidence, 3) verifies accuracy, and 4) generates a professional report.

## Features

- **PDF upload**: drag & drop PDF upload with validation and progress
- **PDF text extraction**: `pdf-parse` extracts raw text (stored temporarily)
- **Claim extraction (OpenRouter)**: extracts checkable claims (stats, dates, technical, financial)
- **Live verification (Tavily + OpenRouter)**: web search → verdict engine (VERIFIED / INACCURATE / FALSE)
- **Results dashboard**: accuracy score + animated cards + sources + reasoning
- **Exports**: download JSON + download PDF report (client-side PDF)
- **Security**: `helmet`, strict file limits, CORS, basic rate limiting, centralized error handling

## Tech Stack

- **Frontend**: React + Vite + TailwindCSS + Framer Motion + Axios + React Dropzone + Lucide + React Router
- **Backend**: Node.js + Express
- **AI**: OpenRouter API
- **Search**: Tavily Search API
- **PDF**: `multer` + `pdf-parse`
- **Deploy**: Render (API) + Vercel (Web)

## Project Structure

```
root/
  client/   # React app
  server/   # Express API
  render.yaml
  README.md
```

## Local Setup

### 1) Configure environment variables

Create and edit:

- `server/.env`
```
PORT=5000
OPENROUTER_API_KEY=YOUR_OPENROUTER_KEY
OPENROUTER_MODEL=openai/gpt-4o-mini
OPENROUTER_SITE_URL=http://localhost:5173
OPENROUTER_APP_NAME=AI Fact-Check Agent
TAVILY_API_KEY=YOUR_TAVILY_KEY
CLIENT_ORIGIN=http://localhost:5173
```

- `client/.env`
```
VITE_API_URL=http://localhost:5000
```

### 2) Install & run

Backend:
```bash
cd server
npm install
npm run dev
```

Frontend:
```bash
cd client
npm install
npm run dev
```

Open: `http://localhost:5173`

## API Endpoints

- `GET /api/health`
- `POST /api/upload` (multipart form-data, field name: `pdf`)
- `POST /api/extract-claims` `{ "fileId": "..." }`
- `POST /api/verify` `{ "fileId": "...", "claims": [{ "claim": "...", "type": "...", "confidence": 0.9 }] }`

## Deployment

### Backend → Render

1. Push this repo to GitHub.
2. In Render: **New → Blueprint** and select the repository.
3. Render will read `render.yaml`. Set environment variables:
   - `OPENROUTER_API_KEY`
   - `OPENROUTER_MODEL`
   - `OPENROUTER_SITE_URL`
   - `OPENROUTER_APP_NAME`
   - `TAVILY_API_KEY`
   - `CLIENT_ORIGIN` (your Vercel URL, e.g. `https://your-app.vercel.app`)
4. Deploy. Verify:
   - `https://<your-render-service>.onrender.com/api/health`

### Frontend → Vercel

1. Import the GitHub repo in Vercel.
2. Set:
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add env var:
   - `VITE_API_URL=https://<your-render-service>.onrender.com`
4. Deploy and test the full flow in production.

## Screenshots

- Landing Page (placeholder)
- Upload Dashboard (placeholder)
- Results Dashboard (placeholder)

