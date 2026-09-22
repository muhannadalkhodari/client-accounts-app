// يحوّل نصاً عربياً (أو مختلطاً مع أرقام/حروف لاتينية) إلى شكل جاهز للرسم
// المباشر كنص عادي من اليسار لليمين داخل jsPDF، الذي لا يدعم العربية أصلياً:
// 1) إعادة تشكيل الحروف العربية إلى أشكالها السياقية الصحيحة (متصلة، غير منفصلة).
// 2) إعادة ترتيب النص إلى ترتيبه البصري الصحيح حسب خوارزمية Unicode Bidi،
//    مع إبقاء أي أرقام/نص لاتيني مُضمَّن بترتيبه الطبيعي دون عكس.
import bidiFactory from 'bidi-js'
import ArabicReshaper from 'arabic-reshaper'

const bidi = bidiFactory()

export function toVisualArabic(text) {
  if (!text) return ''
  const shaped = ArabicReshaper.convertArabic(text)
  const embeddingLevels = bidi.getEmbeddingLevels(shaped, 'rtl')
  const flips = bidi.getReorderSegments(shaped, embeddingLevels)
  const chars = shaped.split('')
  for (const [start, end] of flips) {
    let s = start
    let e = end
    while (s < e) {
      const tmp = chars[s]
      chars[s] = chars[e]
      chars[e] = tmp
      s++
      e--
    }
  }
  return chars.join('')
}
