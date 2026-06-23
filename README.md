# PDF Agent Demo

A single-page PDF chat application. Upload a PDF, get an AI-generated summary, then ask questions about the document — all powered by a local **Ollama** backend.

## Features

- Upload PDF (drag & drop or file picker)
- Automatic document summary via local LLM
- Follow-up Q&A grounded in PDF content
- Dark, modern chat UI
- No authentication required

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React.js + Vite                     |
| Backend  | Node.js + Express                   |
| LLM      | Ollama (Google Gemma / Gemini-family local models) |
| PDF      | pdf-parse                           |

## Prerequisites

1. **Node.js** 18+
2. **Ollama** — [https://ollama.com](https://ollama.com)

Pull a local model (Gemma is Google's open-weight family, commonly used with Ollama):

```bash
ollama pull gemma2:2b
```

For larger/better results:

```bash
ollama pull gemma2:9b
```

> Set `OLLAMA_MODEL` in `backend/.env` to match the model you pulled.

## Quick Start

### 1. Backend

```bash
cd backend
npm install
copy .env.example .env   # Windows
# cp .env.example .env   # macOS / Linux

npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

## Configuration

Create `backend/.env` from `.env.example`:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma2:2b
```

| Variable          | Default                  | Description              |
|-------------------|--------------------------|--------------------------|
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama API endpoint      |
| `OLLAMA_MODEL`    | `gemma2:2b`              | Model name in Ollama     |

## API Endpoints

| Method | Path           | Description                    |
|--------|----------------|--------------------------------|
| GET    | `/api/health`  | Health check + Ollama status   |
| POST   | `/api/upload`  | Upload PDF, returns summary    |
| POST   | `/api/chat`    | Ask a question about the PDF   |

## Project Structure

```
PDFAgent/
├── backend/
│   ├── src/
│   │   ├── index.js          # Express app
│   │   ├── pdfService.js     # PDF text extraction
│   │   └── ollamaService.js  # Ollama chat integration
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.jsx       # Main chat UI
    │   ├── api.js        # API client
    │   └── index.css     # Global styles
    └── package.json
```

## Notes

- Sessions are stored in memory (demo only — restarts clear state).
- PDF text is truncated at ~120k characters for context limits.
- Scanned/image-only PDFs without embedded text will fail extraction.
