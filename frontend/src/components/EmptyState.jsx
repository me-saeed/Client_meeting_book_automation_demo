import PdfIcon from './icons/PdfIcon'
import UploadZone from './UploadZone'

export default function EmptyState({
  uploading,
  dragOver,
  fileInputRef,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileChange,
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <PdfIcon />
      </div>
      <h2>Upload a PDF to get started</h2>
      <p>
        Drop your document here or browse to upload. The agent will summarize it,
        then you can ask questions about the content.
      </p>
      <UploadZone
        uploading={uploading}
        dragOver={dragOver}
        fileInputRef={fileInputRef}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onFileChange={onFileChange}
      />
    </div>
  )
}
