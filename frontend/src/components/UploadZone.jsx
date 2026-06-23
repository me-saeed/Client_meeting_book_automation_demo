import PdfIcon from './icons/PdfIcon'

export default function UploadZone({
  uploading,
  dragOver,
  fileInputRef,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileChange,
}) {
  return (
    <label
      className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={onFileChange}
        disabled={uploading}
      />
      <span className="upload-btn-label">
        <PdfIcon />
        {uploading ? 'Processing...' : 'Choose PDF'}
      </span>
      <span className="upload-hint">or drag and drop · max 20 MB</span>
    </label>
  )
}
