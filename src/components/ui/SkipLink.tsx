export function SkipLink() {
  return (
    <a
      href="#main-content"
      className={[
        'absolute left-2 top-2 z-[9999] rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white',
        'translate-y-[-200%] transition-transform focus:translate-y-0',
      ].join(' ')}
    >
      Skip to main content
    </a>
  )
}
