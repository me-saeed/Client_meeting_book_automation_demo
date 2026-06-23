import ReactMarkdown from 'react-markdown'

export default function Message({ role, content }) {
  const label = role === 'user' ? 'You' : 'PDF Agent'

  return (
    <div className={`message ${role}`}>
      <span className="message-label">{label}</span>
      <div className="message-bubble">
        {role === 'assistant' ? (
          <ReactMarkdown>{content}</ReactMarkdown>
        ) : (
          <p>{content}</p>
        )}
      </div>
    </div>
  )
}
