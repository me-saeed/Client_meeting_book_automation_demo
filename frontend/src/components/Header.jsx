import PdfIcon from './icons/PdfIcon'

export default function Header({ ollamaOnline }) {
  const statusLabel =
    ollamaOnline === null
      ? 'Checking...'
      : ollamaOnline
        ? 'Ollama online'
        : 'Ollama offline'

  const statusClass =
    ollamaOnline === true ? 'online' : ollamaOnline === false ? 'offline' : ''

  return (
    <header className="app-header">
      <div className="app-logo">
        <div className="logo-icon">
          <PdfIcon />
        </div>
        <div>
          <div className="app-title">PDF Agent</div>
          <div className="app-subtitle">Powered by Ollama</div>
        </div>
      </div>
      <div className="status-badge">
        <span className={`status-dot ${statusClass}`} />
        {statusLabel}
      </div>
    </header>
  )
}
