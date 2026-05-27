import { useEffect, useState } from 'react'

// Shared bottom-sheet shell. Handles backdrop, slide animations, and a small
// grab handle. The parent passes `open` and `onClose`; the unmount is deferred
// until the close animation finishes so the slide-down is visible.
export default function BottomSheet({ open, onClose, children }) {
  const [render, setRender] = useState(open)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (open) {
      setRender(true)
      setClosing(false)
    } else if (render) {
      setClosing(true)
      const t = setTimeout(() => {
        setRender(false)
        setClosing(false)
      }, 200)
      return () => clearTimeout(t)
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!render) return null

  return (
    <div className="absolute inset-0 z-30 flex items-end">
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/35 ${
          closing ? 'anim-backdrop-out' : 'anim-backdrop-in'
        }`}
      />
      <div
        className={`relative w-full bg-surface rounded-t-2xl ${
          closing ? 'anim-sheet-out' : 'anim-sheet-in'
        }`}
      >
        <div className="flex justify-center pt-2.5 pb-1">
          <span className="block w-10 h-1 rounded-full bg-card-border" />
        </div>
        {children}
      </div>
    </div>
  )
}
