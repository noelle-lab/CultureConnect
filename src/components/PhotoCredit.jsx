// A small, unobtrusive attribution overlay for the real, openly-licensed
// photographs used across the marketplace. Creative Commons BY / BY-SA images
// require crediting the photographer and naming the license, so every photo
// carries an `imageCredit` record (see src/data/mockData.js) that this renders.
export default function PhotoCredit({ credit, className = '' }) {
  if (!credit) return null
  const { title, author, license, licenseUrl, source } = credit
  return (
    <span className={`photo-credit ${className}`.trim()}>
      Photo:{' '}
      {source ? (
        <a href={source} target="_blank" rel="noopener noreferrer">
          {title}
        </a>
      ) : (
        title
      )}
      {author ? ` by ${author}` : ''} ·{' '}
      {licenseUrl ? (
        <a href={licenseUrl} target="_blank" rel="noopener noreferrer">
          {license}
        </a>
      ) : (
        license
      )}
    </span>
  )
}
