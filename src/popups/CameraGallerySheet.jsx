import { Camera, Image as ImageIcon } from 'lucide-react'
import BottomSheet from '../components/BottomSheet'

// Popup — choose between camera capture and gallery pick. Both just call
// onChoose; the parent decides what "captured" means.
export default function CameraGallerySheet({ open, onClose, onChoose }) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="px-5 pt-2 pb-6">
        <h2 className="text-[18px] font-medium">Add a document</h2>
        <p className="text-[13px] text-ink-muted mt-1">
          How would you like to capture it?
        </p>

        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={() => onChoose('camera')}
            className="press w-full flex items-center gap-3 px-3 py-3.5 rounded-xl border border-card-border text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-soft text-brand flex items-center justify-center">
              <Camera size={20} strokeWidth={1.9} />
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-medium">Take a photo</p>
              <p className="text-[12px] text-ink-muted">Use the camera</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onChoose('gallery')}
            className="press w-full flex items-center gap-3 px-3 py-3.5 rounded-xl border border-card-border text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-soft text-brand flex items-center justify-center">
              <ImageIcon size={20} strokeWidth={1.9} />
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-medium">Choose from gallery</p>
              <p className="text-[12px] text-ink-muted">Pick an existing image</p>
            </div>
          </button>
        </div>
      </div>
    </BottomSheet>
  )
}
