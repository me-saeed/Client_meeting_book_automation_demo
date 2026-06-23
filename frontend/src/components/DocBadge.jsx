import PdfIcon from './icons/PdfIcon'

export default function DocBadge({ filename }) {
  if (!filename) return null

  return (
    <div className="doc-badge">
      <PdfIcon />
      <span>{filename}</span>
    </div>
  )
}
