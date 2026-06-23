import SendIcon from './icons/SendIcon'
import ErrorBanner from './ErrorBanner'

export default function ChatInput({
  hasSession,
  input,
  loading,
  error,
  textareaRef,
  onInputChange,
  onKeyDown,
  onSend,
  onReset,
}) {
  return (
    <div className="input-area">
      <ErrorBanner message={error} />

      <div className={`input-wrapper ${!hasSession ? 'disabled' : ''}`}>
        <textarea
          ref={textareaRef}
          className="chat-input"
          placeholder={
            hasSession
              ? 'Ask a question about the PDF...'
              : 'Upload a PDF first to start chatting'
          }
          value={input}
          onChange={onInputChange}
          onKeyDown={onKeyDown}
          disabled={!hasSession || loading}
          rows={1}
        />
        <button
          className="send-btn"
          onClick={onSend}
          disabled={!hasSession || !input.trim() || loading}
          aria-label="Send message"
        >
          <SendIcon />
        </button>
      </div>

      <div className="input-footer">
        <span className="input-hint">Enter to send · Shift+Enter for new line</span>
        {hasSession && (
          <button className="new-doc-btn" onClick={onReset}>
            Upload new PDF
          </button>
        )}
      </div>
    </div>
  )
}
