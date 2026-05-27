import * as Icons from 'lucide-react'

// Renders a lucide icon by name inside a soft tinted square — used on cards
// and list rows. Falls back to the FileText icon when the name is unknown so
// missing data never crashes the prototype.
export default function IconTile({ name, size = 'md', tone = 'brand' }) {
  const Icon = Icons[name] || Icons.FileText

  const sizing = {
    sm: { box: 'w-9 h-9 rounded-lg', icon: 18 },
    md: { box: 'w-11 h-11 rounded-xl', icon: 22 },
    lg: { box: 'w-12 h-12 rounded-xl', icon: 24 },
  }[size]

  const tones = {
    brand: 'bg-brand-soft text-brand',
    deadline: 'bg-deadline-bg text-deadline-text',
    muted: 'bg-screen-bg text-ink-muted',
  }[tone]

  return (
    <div className={`shrink-0 flex items-center justify-center ${sizing.box} ${tones}`}>
      <Icon size={sizing.icon} strokeWidth={1.9} />
    </div>
  )
}
