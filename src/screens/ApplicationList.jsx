import { Plus, ChevronRight } from 'lucide-react'
import IconTile from '../components/IconTile'
import ProgressBar from '../components/ProgressBar'

// Screen 1 — root list of applications.
export default function ApplicationList({ applications, onOpenApplication, onAddApplication }) {
  return (
    <div className="h-full flex flex-col">
      <header className="px-5 pt-3 pb-4 flex items-start justify-between">
        <div>
          <h1 className="text-[28px] leading-tight font-medium">Applications</h1>
          <p className="text-[13px] text-ink-muted mt-1">
            {applications.length} active · tap + to add a new one
          </p>
        </div>
        <button
          type="button"
          onClick={onAddApplication}
          aria-label="Add application"
          className="press w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center"
        >
          <Plus size={20} strokeWidth={2.25} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-3">
        {applications.map((app) => (
          <button
            key={app.id}
            type="button"
            onClick={() => onOpenApplication(app.id)}
            className={`press w-full text-left bg-surface rounded-xl border p-4 flex items-center gap-3 ${
              app.isNew ? 'border-brand' : 'border-card-border'
            }`}
          >
            <IconTile name={app.icon} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] font-medium truncate">{app.title}</h2>
                {app.isNew && (
                  <span className="shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#e8f3ec] text-[#1f7a3a]">
                    New
                  </span>
                )}
              </div>
              <p className="text-[13px] text-ink-muted mt-0.5">
                {app.documents.length} of {app.docsRequired ?? app.documents.length} documents
              </p>
              <ProgressBar value={app.progressPct} className="mt-3" />
            </div>
            <ChevronRight size={20} className="text-ink-muted shrink-0" strokeWidth={1.75} />
          </button>
        ))}

        <button
          type="button"
          onClick={onAddApplication}
          className="press w-full rounded-xl border border-dashed border-card-border bg-transparent py-4 flex items-center justify-center gap-2 text-[14px] text-ink-muted"
        >
          <Plus size={18} strokeWidth={2} />
          Add application
        </button>
      </div>
    </div>
  )
}
