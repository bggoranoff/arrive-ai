import { useEffect, useRef, useState } from 'react'
import { ArrowUp, FileText, Sparkles } from 'lucide-react'
import ScreenHeader from '../components/ScreenHeader'
import { cannedReplies, initialChatThread } from '../data/mockData'

// Screen 4 — document summary + canned chat thread. Sending a message appends
// a user bubble and a hard-coded assistant reply after a short delay.
export default function DocumentChat({ document, onBack }) {
  const [thread, setThread] = useState(initialChatThread)
  const [draft, setDraft] = useState('')
  const [replyTimer, setReplyTimer] = useState(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    // Keep the thread scrolled to the bottom on new messages.
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [thread])

  useEffect(() => {
    return () => {
      if (replyTimer) clearTimeout(replyTimer)
    }
  }, [replyTimer])

  const send = () => {
    const text = draft.trim()
    if (!text) return
    const userMsg = { id: `u-${Date.now()}`, role: 'user', text }
    setThread((t) => [...t, userMsg])
    setDraft('')

    const reply = cannedReplies[Math.floor(Math.random() * cannedReplies.length)]
    const timer = setTimeout(() => {
      setThread((t) => [
        ...t,
        { id: `a-${Date.now()}`, role: 'assistant', text: reply },
      ])
    }, 700)
    setReplyTimer(timer)
  }

  return (
    <div className="h-full flex flex-col">
      <ScreenHeader
        title={document?.name || 'Document'}
        onBack={onBack}
        right={
          <button
            type="button"
            className="press w-9 h-9 rounded-full flex items-center justify-center hover:bg-screen-bg"
            aria-label="Document details"
          >
            <FileText size={20} strokeWidth={1.9} />
          </button>
        }
      />

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pb-3">
        {/* Summary card */}
        <div className="rounded-xl bg-surface border border-card-border p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-brand" strokeWidth={2} />
            <h2 className="text-[14px] font-medium">What this document is</h2>
          </div>
          <p className="text-[13px] leading-relaxed text-ink-muted">
            Official form to extend your residence permit. It asks for personal
            details, your address, and the purpose of your stay.
          </p>
        </div>

        {/* Chat thread */}
        <ul className="space-y-3">
          {thread.map((m) => (
            <li
              key={m.id}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-brand text-white rounded-br-md'
                    : 'bg-surface border border-card-border text-ink rounded-bl-md'
                }`}
              >
                {m.text}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Chat input */}
      <div className="px-4 pb-4 pt-2 border-t border-card-border bg-screen-bg">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
          className="flex items-center gap-2 rounded-full bg-surface border border-card-border pl-4 pr-1.5 py-1.5"
        >
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask about this document..."
            className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-ink-muted py-1"
          />
          <button
            type="submit"
            aria-label="Send"
            disabled={!draft.trim()}
            className={`press w-9 h-9 rounded-full flex items-center justify-center ${
              draft.trim() ? 'bg-brand text-white' : 'bg-screen-bg text-ink-muted'
            }`}
          >
            <ArrowUp size={18} strokeWidth={2.25} />
          </button>
        </form>
      </div>
    </div>
  )
}
