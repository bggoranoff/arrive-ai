import { ChevronLeft } from 'lucide-react'

// Shared back-button-and-title row used on screens 2–4.
export default function ScreenHeader({ title, onBack, right = null }) {
  return (
    <div className="flex items-center gap-3 px-5 pt-2 pb-4">
      <button
        type="button"
        onClick={onBack}
        className="press -ml-2 w-9 h-9 flex items-center justify-center rounded-full hover:bg-screen-bg"
        aria-label="Back"
      >
        <ChevronLeft size={24} strokeWidth={2} />
      </button>
      <h1 className="flex-1 text-[20px] leading-tight font-medium pr-2">
        {title}
      </h1>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  )
}
