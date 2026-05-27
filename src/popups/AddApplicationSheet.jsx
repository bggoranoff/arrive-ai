import { ChevronRight } from 'lucide-react'
import BottomSheet from '../components/BottomSheet'
import IconTile from '../components/IconTile'
import { applicationCatalog } from '../data/mockData'

// Popup — pick an application to add. Already-added ones are filtered out.
export default function AddApplicationSheet({ open, onClose, onPick, existingIds }) {
  const choices = applicationCatalog.filter((c) => !existingIds.includes(c.id))

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="px-5 pt-2 pb-6">
        <h2 className="text-[18px] font-medium">Add an application</h2>
        <p className="text-[13px] text-ink-muted mt-1">
          Pick one to start tracking it.
        </p>

        <ul className="mt-4 max-h-[440px] overflow-y-auto -mx-2">
          {choices.length === 0 && (
            <li className="px-2 py-6 text-center text-[13px] text-ink-muted">
              You've added all the suggested applications.
            </li>
          )}
          {choices.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onPick(c.id)}
                className="press w-full flex items-center gap-3 px-2 py-3 rounded-xl text-left hover:bg-screen-bg"
              >
                <IconTile name={c.icon} />
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium">{c.title}</p>
                  <p className="text-[12px] text-ink-muted">{c.subtitle}</p>
                </div>
                <ChevronRight size={20} className="text-ink-muted" strokeWidth={1.75} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </BottomSheet>
  )
}
