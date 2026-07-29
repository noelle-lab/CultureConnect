import { useRef, useState } from 'react'

// A small picture picker used across the admin editors. Admins can either:
//   • paste an image URL, or
//   • upload a file from their computer (stored inline as a data URL so it
//     survives in the prototype's localStorage — no server needed).
//
// Props: value (string), onChange(nextValue), label, aspect ('1' | '16/9')
export default function ImageInput({
  value,
  onChange,
  label = 'Picture',
  aspect = '1',
}) {
  const fileRef = useRef(null)
  const [error, setError] = useState('')

  function onFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }
    // ~2.5MB cap keeps localStorage happy.
    if (file.size > 2.5 * 1024 * 1024) {
      setError('That image is a bit large — please use one under ~2.5MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => onChange(reader.result)
    reader.readAsDataURL(file)
  }

  return (
    <div className="field">
      <label>{label}</label>
      <div className="image-input">
        <div
          className="image-input-preview"
          style={{ aspectRatio: aspect }}
          onClick={() => fileRef.current?.click()}
          title="Click to upload an image"
        >
          {value ? (
            <img src={value} alt="" />
          ) : (
            <span className="muted" style={{ fontSize: '0.8rem' }}>
              No image
            </span>
          )}
        </div>
        <div className="image-input-controls">
          <input
            className="input"
            type="text"
            value={value?.startsWith('data:') ? '' : value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={
              value?.startsWith('data:')
                ? 'Uploaded image'
                : 'Paste image URL, or upload'
            }
            disabled={value?.startsWith('data:')}
          />
          <div className="flex gap-8">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => fileRef.current?.click()}
            >
              Upload
            </button>
            {value && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => onChange('')}
              >
                Remove
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={onFile}
          />
        </div>
      </div>
      {error && (
        <div className="muted" style={{ color: 'var(--clay)', fontSize: '0.8rem', marginTop: 4 }}>
          {error}
        </div>
      )}
    </div>
  )
}
