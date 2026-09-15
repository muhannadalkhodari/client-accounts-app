export default function PinDots({ length = 4, filledCount = 0, shake = false }) {
  return (
    <div className={`flex justify-center gap-4 ${shake ? 'shake' : ''}`} dir="ltr">
      {Array.from({ length }).map((_, i) => (
        <span
          key={i}
          className={`h-3.5 w-3.5 rounded-full border transition-colors duration-150 ${
            i < filledCount
              ? 'border-ledger-accent bg-ledger-accent'
              : 'border-ledger-border bg-transparent'
          }`}
        />
      ))}
    </div>
  )
}
