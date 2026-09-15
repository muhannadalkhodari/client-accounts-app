// رسمة أصلية بأسلوب خطوط رفيعة ذهبية — مبنى مكتب عقاري بسيط مع لوحة "للإيجار/للبيع"،
// بروح دفتر الأستاذ (خطوط دقيقة بدل الألوان المصمتة).
export default function OfficeIllustration({ className = '' }) {
  return (
    <svg
      viewBox="0 0 240 160"
      fill="none"
      className={className}
      role="img"
      aria-label="رسم توضيحي لمكتب عقاري"
    >
      {/* الأرض */}
      <line x1="20" y1="140" x2="220" y2="140" stroke="#c9a24b" strokeWidth="1" opacity="0.5" />

      {/* جسم المبنى */}
      <rect x="55" y="55" width="130" height="85" stroke="#c9a24b" strokeWidth="1.5" />
      {/* السقف المثلث */}
      <path d="M45 55 L120 20 L195 55" stroke="#c9a24b" strokeWidth="1.5" strokeLinejoin="round" />

      {/* الباب */}
      <rect x="107" y="95" width="26" height="45" stroke="#c9a24b" strokeWidth="1.5" />
      <circle cx="126" cy="118" r="1.6" fill="#c9a24b" />

      {/* نوافذ */}
      <rect x="70" y="75" width="20" height="20" stroke="#c9a24b" strokeWidth="1.2" opacity="0.85" />
      <rect x="150" y="75" width="20" height="20" stroke="#c9a24b" strokeWidth="1.2" opacity="0.85" />
      <line x1="80" y1="75" x2="80" y2="95" stroke="#c9a24b" strokeWidth="1" opacity="0.6" />
      <line x1="70" y1="85" x2="90" y2="85" stroke="#c9a24b" strokeWidth="1" opacity="0.6" />
      <line x1="160" y1="75" x2="160" y2="95" stroke="#c9a24b" strokeWidth="1" opacity="0.6" />
      <line x1="150" y1="85" x2="170" y2="85" stroke="#c9a24b" strokeWidth="1" opacity="0.6" />

      {/* لوحة معلّقة أمام المبنى */}
      <line x1="30" y1="100" x2="30" y2="140" stroke="#c9a24b" strokeWidth="1.2" opacity="0.7" />
      <rect x="14" y="100" width="32" height="16" rx="1" stroke="#c9a24b" strokeWidth="1.2" opacity="0.85" />
      <line x1="19" y1="106" x2="41" y2="106" stroke="#c9a24b" strokeWidth="1" opacity="0.6" />
      <line x1="19" y1="111" x2="35" y2="111" stroke="#c9a24b" strokeWidth="1" opacity="0.6" />
    </svg>
  )
}
