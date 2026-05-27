// Thin progress bar used on cards and pinned at the bottom of screen 2.
export default function ProgressBar({ value = 0, className = '' }) {
  return (
    <div className={`h-[6px] w-full rounded-full bg-screen-bg overflow-hidden ${className}`}>
      <div
        className="h-full bg-brand rounded-full transition-[width] duration-500"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
}
