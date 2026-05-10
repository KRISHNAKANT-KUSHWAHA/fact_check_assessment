# AI Fact-Check Agent

AI-powered PDF fact-checking app:
1. Upload a PDF.
2. Extract checkable factual claims.
3. Search live web evidence.
4. Verify claims and generate a downloadable report.

## Features

- **PDF upload**: drag-and-drop PDF upload with validation and progress.
- **PDF text extraction**: `pdf-parse` extracts text from uploaded PDFs.
- **Claim extraction**: OpenRouter model extracts factual claims such as statistics, dates, financial metrics, and technical claims.
- **Live verification**: Tavily search provides sources, then OpenRouter assigns verdicts.
- **Verdicts**: `VERIFIED`, `INACCURATE`, or `FALSE`.
- **Results dashboard**: accuracy score, source links, reasoning, and corrected facts.
- **Exports**: download JSON or a client-side PDF report.
- **Security basics**: `helmet`, upload limits, CORS allowlist, rate limiting, and centralized error handling.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Axios, React Dropzone, Lucide, React Router
- **Backend**: Node.js, Express
- **AI**: OpenRouter API
- **Search**: Tavily Search API
- **PDF**: `multer`, `pdf-parse`
- **Deploy**: Render for API, Vercel for web

## Project Structure

```text
root/
  client/       React + Vite frontend
  server/       Express API
  render.yaml   Render backend blueprint
  README.md
```

## Local Setup

### 1. Configure Environment Variables

Create `server/.env`:

```env
PORT=5000
OPENROUTER_API_KEY=YOUR_OPENROUTER_KEY
OPENROUTER_MODEL=openai/gpt-4o-mini
OPENROUTER_SITE_URL=http://localhost:5173
OPENROUTER_APP_NAME=AI Fact-Check Agent
TAVILY_API_KEY=YOUR_TAVILY_KEY
CLIENT_ORIGIN=http://localhost:5173
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000
```

Notes:
- If Vite starts on another local port, update `CLIENT_ORIGIN` or add it as a comma-separated value, for example `http://localhost:5173,http://localhost:5174`.
- In development, the backend also allows localhost Vite-style ports to avoid CORS issues while testing.
- `OPENROUTER_MODEL` can be changed to any OpenRouter chat model that supports your account.

### 2. Install Dependencies

Backend:

```bash
cd server
npm install
```

Frontend:

```bash
cd client
npm install
```

### 3. Run Locally

Start the backend:

```bash
cd server
npm run dev
```

Start the frontend in another terminal:

```bash
cd client
npm run dev
```

Open the app:

```text
http://localhost:5173
```

## API Endpoints

### Health

```http
GET /api/health
```

Returns service status.

### Upload PDF

```http
POST /api/upload
Content-Type: multipart/form-data
```

Form field:

```text
pdf=<file>
```

Response:

```json
{
  "fileId": "...",
  "originalName": "sample.pdf",
  "pages": 1,
  "textLength": 130
}
```

### Extract Claims

```http
POST /api/extract-claims
Content-Type: application/json
```

Body:

```json
{
  "fileId": "..."
}
```

### Verify Claims

```http
POST /api/verify
Content-Type: application/json
```

Body:

```json
{
  "fileId": "...",
  "claims": [
    {
      "claim": "In 2023, global CO2 emissions reached 37.4 billion tonnes.",
      "type": "statistic",
      "confidence": 0.9
    }
  ]
}
```

## Deployment

### Backend on Render

1. Push this repository to GitHub.
2. In Render, create a new Blueprint service and select the repository.
3. Render reads `render.yaml`.
4. Set these backend environment variables:

```env
OPENROUTER_API_KEY=YOUR_OPENROUTER_KEY
OPENROUTER_MODEL=openai/gpt-4o-mini
OPENROUTER_SITE_URL=https://your-frontend.vercel.app
OPENROUTER_APP_NAME=AI Fact-Check Agent
TAVILY_API_KEY=YOUR_TAVILY_KEY
CLIENT_ORIGIN=https://your-frontend.vercel.app
```

Verify after deploy:

```text
https://<your-render-service>.onrender.com/api/health
```

### Frontend on Vercel

1. Import the GitHub repository in Vercel.
2. Use these settings:

```text
Root Directory: client
Build Command: npm run build
Output Directory: dist
```

3. Add this frontend environment variable:

```env
VITE_API_URL=https://<your-render-service>.onrender.com
```

4. Deploy and test the full upload -> extract -> verify flow.

## Troubleshooting

### CORS Error on Upload

If the browser says `No Access-Control-Allow-Origin header is present`, make sure:

- Backend is running on `http://localhost:5000`.
- Frontend `client/.env` has `VITE_API_URL=http://localhost:5000`.
- Backend `server/.env` has `CLIENT_ORIGIN` matching your browser URL, usually `http://localhost:5173`.
- You restarted the backend after editing `.env`.

### Old PDF Results Appear

The app clears previous results when a new file is selected or a new run starts. If you still see old output:

- Hard refresh the frontend page.
- Restart the Vite dev server.
- Make sure the latest client build/code is running.

### OpenRouter Errors

Check:

- `OPENROUTER_API_KEY` is valid.
- `OPENROUTER_MODEL` is available to your OpenRouter account.
- Your OpenRouter account has credits or access for the selected provider/model.

### Tavily Returns No Sources

Check:

- `TAVILY_API_KEY` is valid.
- The query is specific enough to find web evidence.
- Tavily quota has not been exhausted.

## Useful Scripts

Backend:

```bash
npm run dev
npm start
```

Frontend:

```bash
npm run dev
npm run build
```
