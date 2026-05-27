import { useCallback, useState } from 'react'
import PhoneFrame from './components/PhoneFrame'
import StatusBar from './components/StatusBar'
import ApplicationList from './screens/ApplicationList'
import ApplicationOverview from './screens/ApplicationOverview'
import ScanDocument from './screens/ScanDocument'
import DocumentChat from './screens/DocumentChat'
import AddApplicationSheet from './popups/AddApplicationSheet'
import DeadlineSheet from './popups/DeadlineSheet'
import CameraGallerySheet from './popups/CameraGallerySheet'
import { applicationCatalog, initialApplications } from './data/mockData'

// Single source of truth for the prototype:
//  - applications: mutable copy of the seed data (add app / add doc).
//  - stack: navigation stack with { screen, params, anim }.
//  - popup: { type, params } | null.

const ANIM_MS = 250

export default function App() {
  const [applications, setApplications] = useState(initialApplications)
  const [stack, setStack] = useState([{ screen: 'list', params: {}, anim: null }])
  const [popup, setPopup] = useState(null) // { type, params } | null
  const [closingPopup, setClosingPopup] = useState(false)

  // --- Navigation -----------------------------------------------------------

  const push = useCallback((screen, params = {}) => {
    setStack((s) => [...s, { screen, params, anim: 'in' }])
    setTimeout(() => {
      setStack((s) =>
        s.map((e, i) => (i === s.length - 1 ? { ...e, anim: null } : e))
      )
    }, ANIM_MS)
  }, [])

  const pop = useCallback(() => {
    setStack((s) => {
      if (s.length <= 1) return s
      return s.map((e, i) => (i === s.length - 1 ? { ...e, anim: 'out' } : e))
    })
    setTimeout(() => {
      setStack((s) => (s.length <= 1 ? s : s.slice(0, -1)))
    }, ANIM_MS)
  }, [])

  // --- Popup helpers --------------------------------------------------------

  const openPopup = (type, params = {}) => {
    setClosingPopup(false)
    setPopup({ type, params })
  }
  const closePopup = () => {
    if (!popup) return
    setClosingPopup(true)
    setTimeout(() => {
      setPopup(null)
      setClosingPopup(false)
    }, 200)
  }

  // --- Data mutations -------------------------------------------------------

  const addApplication = (catalogId) => {
    const seed = applicationCatalog.find((c) => c.id === catalogId)
    if (!seed) return
    setApplications((apps) => [
      ...apps,
      {
        id: `${catalogId}-${Date.now()}`,
        icon: seed.icon,
        title: seed.title,
        progressPct: 0,
        isNew: true,
        overview: {
          description: seed.subtitle + '.',
          steps: [
            { text: 'Add the required documents', done: false },
            { text: 'Complete the application form', done: false },
            { text: 'Submit your application', done: false },
          ],
        },
        documents: [],
        docsRequired: 3,
        deadlines: [],
        nextDeadline: null,
        calendarMonth: { month: 5, year: 2026, monthName: 'June' },
      },
    ])
    closePopup()
  }

  const addDocumentToApp = (appId) => {
    setApplications((apps) =>
      apps.map((a) =>
        a.id === appId
          ? {
              ...a,
              documents: [
                ...a.documents,
                {
                  id: `doc-${appId}-${Date.now()}`,
                  icon: 'FileText',
                  name: `Captured document ${a.documents.length + 1}`,
                  status: 'Scanned',
                },
              ],
              progressPct: Math.min(100, a.progressPct + 10),
            }
          : a
      )
    )
  }

  // --- Screen actions -------------------------------------------------------

  const handleOpenApplication = (appId) => push('overview', { appId })
  const handleAddApplication = () => openPopup('add-application')
  const handleOpenDocument = (appId, docId) =>
    push('document', { appId, docId })
  const handleAddDocument = (appId) => push('scan', { appId })
  const handleOpenDeadline = (appId, day) =>
    openPopup('deadline', { appId, day })
  const handleCapture = (appId) => {
    addDocumentToApp(appId)
    pop()
  }
  const handleOpenGalleryPopup = () => openPopup('camera-gallery')

  // --- Lookups --------------------------------------------------------------

  const currentApp = (params) =>
    applications.find((a) => a.id === params?.appId)

  const currentDoc = (params) => {
    const app = currentApp(params)
    return app?.documents.find((d) => d.id === params?.docId) || null
  }

  // --- Render ---------------------------------------------------------------

  const renderScreen = (entry) => {
    switch (entry.screen) {
      case 'list':
        return (
          <ApplicationList
            applications={applications}
            onOpenApplication={handleOpenApplication}
            onAddApplication={handleAddApplication}
          />
        )
      case 'overview': {
        const app = currentApp(entry.params)
        if (!app) return null
        return (
          <ApplicationOverview
            app={app}
            onBack={pop}
            onAddDocument={handleAddDocument}
            onOpenDocument={handleOpenDocument}
            onOpenDeadline={handleOpenDeadline}
          />
        )
      }
      case 'scan': {
        return (
          <ScanDocument
            onBack={pop}
            onCapture={() => handleCapture(entry.params.appId)}
            onOpenGalleryPopup={handleOpenGalleryPopup}
          />
        )
      }
      case 'document': {
        const doc = currentDoc(entry.params)
        return <DocumentChat document={doc} onBack={pop} />
      }
      default:
        return null
    }
  }

  const popupApp =
    popup?.type === 'deadline'
      ? applications.find((a) => a.id === popup.params.appId)
      : null
  const popupDeadline =
    popup?.type === 'deadline' && popupApp
      ? popupApp.deadlines.find((d) => d.day === popup.params.day)
      : null

  // Catalog ids already in the list (strip the timestamp suffix added when an
  // application is added through the popup).
  const existingCatalogIds = applications.map((a) => a.id.replace(/-\d+$/, ''))

  return (
    <PhoneFrame>
      <div className="absolute inset-0 flex flex-col">
        <StatusBar />

        {/* Screen stack */}
        <div className="relative flex-1 overflow-hidden">
          {stack.map((entry, i) => {
            const animClass =
              entry.anim === 'in'
                ? 'anim-slide-in'
                : entry.anim === 'out'
                ? 'anim-slide-out'
                : ''
            const isTop = i === stack.length - 1
            return (
              <div
                key={i}
                className={`absolute inset-0 bg-screen-bg ${animClass}`}
                style={{ zIndex: i + 1, pointerEvents: isTop ? 'auto' : 'none' }}
              >
                {renderScreen(entry)}
              </div>
            )
          })}
        </div>

        {/* Popups (bottom sheets) */}
        <AddApplicationSheet
          open={popup?.type === 'add-application' && !closingPopup}
          onClose={closePopup}
          onPick={addApplication}
          existingIds={existingCatalogIds}
        />
        <DeadlineSheet
          open={popup?.type === 'deadline' && !closingPopup}
          onClose={closePopup}
          deadline={popupDeadline}
          app={popupApp}
        />
        <CameraGallerySheet
          open={popup?.type === 'camera-gallery' && !closingPopup}
          onClose={closePopup}
          onChoose={() => {
            // Both options resolve the same way in the prototype — close the
            // sheet and let the user tap the shutter to "capture".
            closePopup()
          }}
        />
      </div>
    </PhoneFrame>
  )
}
