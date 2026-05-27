import { useEffect, useRef, useState } from 'react'
import { MoreHorizontal, ChevronRight, ChevronLeft, Plus, ClipboardList, CalendarDays, Files, Check } from 'lucide-react'
import ScreenHeader from '../components/ScreenHeader'
import IconTile from '../components/IconTile'
import ProgressBar from '../components/ProgressBar'

// Screen 2 — three swipeable cards over a pinned progress bar.
// The carousel uses CSS scroll-snap; an onScroll handler keeps the active
// pagination dot in sync.

const CARD_WIDTH = 320
const CARD_GAP = 15
const SIDE_PAD = 35

export default function ApplicationOverview({ app, onBack, onAddDocument, onOpenDocument, onOpenDeadline }) {
  const scrollRef = useRef(null)
  const [active, setActive] = useState(0)

  const handleScroll = (e) => {
    const idx = Math.round(e.target.scrollLeft / (CARD_WIDTH + CARD_GAP))
    if (idx !== active) setActive(idx)
  }

  const scrollToCard = (i) => {
    scrollRef.current?.scrollTo({
      left: i * (CARD_WIDTH + CARD_GAP),
      behavior: 'smooth',
    })
  }

  return (
    <div className="h-full flex flex-col">
      <ScreenHeader
        title={app.title}
        onBack={onBack}
        right={
          <button
            type="button"
            className="press w-9 h-9 rounded-full flex items-center justify-center hover:bg-screen-bg"
            aria-label="More"
          >
            <MoreHorizontal size={22} strokeWidth={2} />
          </button>
        }
      />

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-x-auto overflow-y-hidden snap-x snap-mandatory no-scrollbar"
        style={{ scrollPaddingInline: SIDE_PAD }}
      >
        <div
          className="h-full flex items-stretch"
          style={{ paddingInline: SIDE_PAD, gap: CARD_GAP }}
        >
          <CarouselCard>
            <OverviewCard app={app} />
          </CarouselCard>
          <CarouselCard>
            <DeadlinesCard app={app} onOpenDeadline={onOpenDeadline} />
          </CarouselCard>
          <CarouselCard>
            <DocumentsCard app={app} onOpenDocument={onOpenDocument} onAddDocument={onAddDocument} />
          </CarouselCard>
        </div>
      </div>

      {/* Pagination dots */}
      <div className="flex items-center justify-center gap-2 py-3">
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => scrollToCard(i)}
            aria-label={`Go to card ${i + 1}`}
            className={`h-2 rounded-full transition-all ${
              active === i ? 'w-6 bg-brand' : 'w-2 bg-card-border'
            }`}
          />
        ))}
      </div>

      {/* Pinned progress bar — always visible regardless of carousel position */}
      <footer className="border-t border-card-border bg-surface px-5 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] text-ink-muted">Overall progress</span>
          <span className="text-[13px] font-medium">{app.progressPct}%</span>
        </div>
        <ProgressBar value={app.progressPct} />
      </footer>
    </div>
  )
}

function CarouselCard({ children }) {
  return (
    <div
      className="snap-center shrink-0 h-full bg-surface rounded-2xl border border-card-border overflow-hidden flex flex-col"
      style={{ width: CARD_WIDTH }}
    >
      {children}
    </div>
  )
}

function CardHeader({ icon, title }) {
  return (
    <div className="flex items-center gap-3 px-5 pt-5 pb-3">
      <IconTile name={icon} size="sm" />
      <h2 className="text-[17px] font-medium">{title}</h2>
    </div>
  )
}

function OverviewCard({ app }) {
  return (
    <>
      <CardHeader icon="ClipboardList" title="Overview" />
      <div className="px-5 pb-5 overflow-y-auto">
        <p className="text-[14px] leading-relaxed text-ink-muted">
          {app.overview.description}
        </p>
        <h3 className="text-[13px] font-medium text-ink mt-5 mb-2">Next steps</h3>
        <ul className="space-y-2.5">
          {app.overview.steps.map((step, i) => (
            <li
              key={i}
              className={`flex items-center gap-3 py-2 ${
                i === 0 ? '' : 'border-t border-card-border'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                  step.done
                    ? 'bg-brand border-brand text-white'
                    : 'border-card-border bg-white'
                }`}
              >
                {step.done ? <Check size={12} strokeWidth={3} /> : null}
              </span>
              <span
                className={`text-[14px] ${
                  step.done ? 'line-through text-ink-muted' : 'text-ink'
                }`}
              >
                {step.text}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

function DeadlinesCard({ app, onOpenDeadline }) {
  const { month, year, monthName } = app.calendarMonth
  const firstDay = new Date(year, month, 1)
  // Monday-first index: getDay() returns 0=Sun..6=Sat. Convert.
  const leadEmpty = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const deadlineDays = new Set(
    app.deadlines.filter((d) => d.month === month && d.year === year).map((d) => d.day)
  )
  const nextDeadlineDay = app.nextDeadline?.day ?? null

  const cells = []
  for (let i = 0; i < leadEmpty; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <>
      <CardHeader icon="CalendarDays" title="Deadlines" />
      <div className="px-5 pb-5 overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <button className="press w-7 h-7 rounded-full flex items-center justify-center hover:bg-screen-bg" aria-label="Previous month">
            <ChevronLeft size={18} strokeWidth={2} />
          </button>
          <span className="text-[14px] font-medium">
            {monthName} {year}
          </span>
          <button className="press w-7 h-7 rounded-full flex items-center justify-center hover:bg-screen-bg" aria-label="Next month">
            <ChevronRight size={18} strokeWidth={2} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-y-1 text-center text-[11px] text-ink-muted mb-1">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1 text-center">
          {cells.map((day, i) => {
            if (day === null) return <span key={i} />
            const isDeadline = deadlineDays.has(day)
            const isNext = day === nextDeadlineDay
            return (
              <button
                key={i}
                type="button"
                onClick={() => {
                  if (isDeadline) onOpenDeadline(app.id, day)
                }}
                className={`mx-auto w-8 h-8 rounded-full text-[13px] flex items-center justify-center ${
                  isNext
                    ? 'ring-1 ring-brand text-brand font-medium'
                    : isDeadline
                    ? 'bg-deadline-bg text-deadline-text font-medium'
                    : 'text-ink hover:bg-screen-bg'
                }`}
              >
                {day}
              </button>
            )
          })}
        </div>

        {app.nextDeadline && (
          <div className="mt-4 flex items-start gap-2">
            <span
              className="mt-1.5 w-2 h-2 rounded-full shrink-0"
              style={{ background: 'var(--color-deadline-dot)' }}
            />
            <p className="text-[13px] text-ink">
              Next: {app.nextDeadline.day} {app.nextDeadline.monthName} ·{' '}
              <span className="text-ink-muted">{app.nextDeadline.label}</span>
            </p>
          </div>
        )}
      </div>
    </>
  )
}

function DocumentsCard({ app, onOpenDocument, onAddDocument }) {
  return (
    <>
      <CardHeader icon="Files" title="Documents" />
      <div className="px-3 pb-5 overflow-y-auto">
        <ul className="space-y-1">
          {app.documents.map((doc) => (
            <li key={doc.id}>
              <button
                type="button"
                onClick={() => onOpenDocument(app.id, doc.id)}
                className="press w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-screen-bg text-left"
              >
                <IconTile name={doc.icon} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium truncate">{doc.name}</p>
                  <p className="text-[12px] text-ink-muted">{doc.status}</p>
                </div>
                <ChevronRight size={18} className="text-ink-muted" strokeWidth={1.75} />
              </button>
            </li>
          ))}
          {app.documents.length === 0 && (
            <li className="px-2 py-3 text-[13px] text-ink-muted">
              No documents yet — add the first one below.
            </li>
          )}
        </ul>
        <button
          type="button"
          onClick={() => onAddDocument(app.id)}
          className="press mt-3 mx-2 w-[calc(100%-16px)] rounded-xl border border-dashed border-card-border py-3 flex items-center justify-center gap-2 text-[14px] text-ink-muted"
        >
          <Plus size={18} strokeWidth={2} />
          Add a document
        </button>
      </div>
    </>
  )
}
