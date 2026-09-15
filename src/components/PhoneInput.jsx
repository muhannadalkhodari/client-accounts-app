import { COUNTRY_CODES } from '../data/countryCodes.js'

export default function PhoneInput({ countryCode, phone, onCountryChange, onPhoneChange }) {
  return (
    <div className="flex gap-2">
      <select
        value={countryCode}
        onChange={(e) => onCountryChange(e.target.value)}
        className="w-28 shrink-0 rounded-xl border border-ledger-border bg-ledger-surface px-2 text-sm text-ledger-text focus:outline-none focus:ring-1 focus:ring-ledger-accent"
      >
        {COUNTRY_CODES.map((c) => (
          <option key={c.code} value={c.dial}>
            {c.dial} {c.name}
          </option>
        ))}
      </select>
      <input
        type="tel"
        inputMode="numeric"
        value={phone}
        onChange={(e) => onPhoneChange(e.target.value.replace(/[^0-9]/g, ''))}
        placeholder="9xxxxxxxx"
        className="numerals flex-1 rounded-xl border border-ledger-border bg-ledger-surface px-4 py-2.5 text-sm text-ledger-text placeholder:text-ledger-muted focus:outline-none focus:ring-1 focus:ring-ledger-accent"
      />
    </div>
  )
}
