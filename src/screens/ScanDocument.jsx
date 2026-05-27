import { Zap, Image as ImageIcon, Camera, RotateCw, Sparkles } from 'lucide-react'
import ScreenHeader from '../components/ScreenHeader'

// Screen 3 — mock camera viewfinder. Tapping the shutter or gallery icon
// triggers onCapture (which adds a stub document and pops back).
export default function ScanDocument({ onBack, onCapture, onOpenGalleryPopup }) {
  return (
    <div className="h-full flex flex-col">
      <ScreenHeader
        title="Scan document"
        onBack={onBack}
        right={
          <button
            type="button"
            className="press w-9 h-9 rounded-full flex items-center justify-center hover:bg-screen-bg"
            aria-label="Toggle flash"
          >
            <Zap size={20} strokeWidth={2} />
          </button>
        }
      />

      <div className="flex-1 px-5 pb-5 flex flex-col">
        {/* Viewfinder */}
        <div className="relative flex-1 rounded-2xl bg-[#0f1115] overflow-hidden">
          {/* Corner brackets */}
          <Bracket className="top-4 left-4" corner="tl" />
          <Bracket className="top-4 right-4" corner="tr" />
          <Bracket className="bottom-4 left-4" corner="bl" />
          <Bracket className="bottom-4 right-4" corner="br" />

          {/* Dashed document guide line */}
          <div className="absolute inset-x-10 top-1/2 -translate-y-1/2 border-t border-dashed border-white/30" />

          <p className="absolute inset-x-0 bottom-6 text-center text-[12px] text-white/70 px-6">
            Align the document inside the frame
          </p>
        </div>

        {/* Controls row */}
        <div className="mt-5 flex items-center justify-around">
          <button
            type="button"
            onClick={onOpenGalleryPopup}
            aria-label="Open gallery"
            className="press w-12 h-12 rounded-xl bg-surface border border-card-border flex items-center justify-center"
          >
            <ImageIcon size={22} strokeWidth={1.9} />
          </button>

          <button
            type="button"
            onClick={onCapture}
            aria-label="Capture"
            className="press relative w-[72px] h-[72px] rounded-full bg-brand text-white flex items-center justify-center ring-4 ring-brand/20"
          >
            <Camera size={28} strokeWidth={2} />
          </button>

          <button
            type="button"
            aria-label="Flip camera"
            className="press w-12 h-12 rounded-xl bg-surface border border-card-border flex items-center justify-center"
          >
            <RotateCw size={22} strokeWidth={1.9} />
          </button>
        </div>

        {/* Hint card */}
        <div className="mt-4 rounded-xl bg-surface border border-card-border px-4 py-3 flex items-center gap-3">
          <Sparkles size={18} className="text-brand shrink-0" strokeWidth={1.9} />
          <p className="text-[13px] text-ink-muted">
            We'll read the document for you
          </p>
        </div>
      </div>
    </div>
  )
}

function Bracket({ className, corner }) {
  const base = 'absolute w-6 h-6 border-white/80'
  const sides = {
    tl: 'border-t-2 border-l-2 rounded-tl-md',
    tr: 'border-t-2 border-r-2 rounded-tr-md',
    bl: 'border-b-2 border-l-2 rounded-bl-md',
    br: 'border-b-2 border-r-2 rounded-br-md',
  }[corner]
  return <div className={`${base} ${sides} ${className}`} />
}
