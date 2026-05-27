import { Signal, Wifi, BatteryMedium } from 'lucide-react'

// Mocked iOS-style status bar — purely cosmetic.
export default function StatusBar() {
  return (
    <div className="flex items-center justify-between px-6 pt-3 pb-2 text-[13px] font-medium text-ink select-none">
      <span>9:41</span>
      <div className="flex items-center gap-1.5">
        <Signal size={14} strokeWidth={2.25} />
        <Wifi size={14} strokeWidth={2.25} />
        <BatteryMedium size={18} strokeWidth={2.25} />
      </div>
    </div>
  )
}
