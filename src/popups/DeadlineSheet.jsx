import { CalendarDays, Bell } from 'lucide-react'
import BottomSheet from '../components/BottomSheet'

// Popup — details for a tapped calendar day. Receives the deadline object
// from the parent (resolved from app + day).
export default function DeadlineSheet({ open, onClose, deadline, app }) {
  if (!deadline) {
    return <BottomSheet open={open} onClose={onClose}><div className="p-6" /></BottomSheet>
  }
  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="px-5 pt-2 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-deadline-bg text-deadline-text flex items-center justify-center">
            <CalendarDays size={22} strokeWidth={1.9} />
          </div>
          <div>
            <p className="text-[12px] text-ink-muted uppercase tracking-wide">Deadline</p>
            <h2 className="text-[18px] font-medium leading-tight">
              {deadline.day} {app?.calendarMonth?.monthName} {app?.calendarMonth?.year}
            </h2>
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-screen-bg p-4">
          <p className="text-[14px] font-medium">{deadline.label}</p>
          <p className="text-[13px] text-ink-muted mt-1">
            For: {app?.title}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="press py-3 rounded-xl border border-card-border text-[14px] font-medium"
          >
            Close
          </button>
          <button
            type="button"
            className="press py-3 rounded-xl bg-brand text-white text-[14px] font-medium flex items-center justify-center gap-2"
          >
            <Bell size={16} strokeWidth={2} />
            Remind me
          </button>
        </div>
      </div>
    </BottomSheet>
  )
}
