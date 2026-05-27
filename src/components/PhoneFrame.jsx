// The phone-shaped chrome that wraps the entire app. Fixed pixel dimensions so
// it looks like a device on a desktop background.
export default function PhoneFrame({ children }) {
  return (
    <div className="min-h-full w-full flex items-center justify-center py-8 px-4">
      <div
        className="relative bg-black rounded-[44px] p-[10px] shadow-[0_30px_60px_-20px_rgba(15,23,42,0.35)]"
        style={{ width: 410 }}
      >
        <div
          className="relative overflow-hidden bg-screen-bg rounded-[36px]"
          style={{ width: 390, height: 780 }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
