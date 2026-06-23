import DocBadge from './DocBadge'
import EmptyState from './EmptyState'
import Message from './Message'
import TypingIndicator from './TypingIndicator'

export default function MessageList({
  messages,
  hasSession,
  filename,
  loading,
  uploading,
  dragOver,
  messagesEndRef,
  fileInputRef,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileChange,
}) {
  return (
    <div className="messages-area">
      {!hasSession && messages.length === 0 && (
        <EmptyState
          uploading={uploading}
          dragOver={dragOver}
          fileInputRef={fileInputRef}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onFileChange={onFileChange}
        />
      )}

      {hasSession && <DocBadge filename={filename} />}

      {messages.map((msg) => (
        <Message key={msg.id} role={msg.role} content={msg.content} />
      ))}

      {loading && <TypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  )
}
