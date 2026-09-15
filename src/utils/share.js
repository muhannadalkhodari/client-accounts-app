// يحاول فتح واجهة المشاركة الأصلية للجهاز (Web Share API) مع إرفاق ملف PDF مباشرة.
// إذا لم تكن مدعومة (غالباً على الحاسوب)، يُنزَّل الملف ويُفتح رابط واتساب
// مع العميل ليقوم المستخدم بإرفاق الملف يدوياً.
export async function shareClientPdf({ blob, fileName, phoneFullNumber }) {
  const file = new File([blob], fileName, { type: 'application/pdf' })

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: fileName })
      return 'shared'
    } catch (err) {
      if (err.name === 'AbortError') return 'cancelled'
      // نكمل إلى الحل البديل أدناه بدل إظهار خطأ
    }
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  if (phoneFullNumber) {
    window.open(`https://wa.me/${phoneFullNumber}`, '_blank')
  }
  return 'downloaded'
}
