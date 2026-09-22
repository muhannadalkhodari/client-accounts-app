import { formatAmount } from './format.js'

const FONT_URL = `${import.meta.env.BASE_URL}fonts/Amiri-Regular.ttf`
let cachedFontBytes = null

async function loadFontBytes() {
  if (cachedFontBytes) return cachedFontBytes
  const res = await fetch(FONT_URL)
  if (!res.ok) throw new Error('تعذّر تحميل خط PDF')
  cachedFontBytes = await res.arrayBuffer()
  return cachedFontBytes
}

const PAGE = { width: 595.28, height: 841.89, margin: 40 }
const ROW_HEIGHT = 24
const HEADER_HEIGHT = 26

// أعمدة الجدول من اليمين إلى اليسار (كما تُقرأ الوثيقة عربياً)
const COLUMNS = [
  { key: 'date', label: 'التاريخ', width: 90 },
  { key: 'description', label: 'البيان', width: 225 },
  { key: 'receipt', label: 'قبض', width: 100 },
  { key: 'payment', label: 'دفع', width: 100 },
]

function columnBounds() {
  let xRight = PAGE.width - PAGE.margin
  return COLUMNS.map((col) => {
    const xLeft = xRight - col.width
    const bounds = { ...col, xLeft, xRight }
    xRight = xLeft
    return bounds
  })
}

// يقصّ نصاً عربياً (بعد تشكيله) ليُناسب عرضاً معيناً، بإضافة "…" عند القص
function truncateToWidth(rawText, font, size, maxWidth) {
  if (font.widthOfTextAtSize(rawText, size) <= maxWidth) return rawText
  let low = 0
  let high = rawText.length
  while (low < high) {
    const mid = Math.ceil((low + high) / 2)
    const candidate = rawText.slice(0, mid) + '…'
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) low = mid
    else high = mid - 1
  }
  return low > 0 ? rawText.slice(0, low) + '…' : ''
}

// يُنشئ PDF يحوي فقط جدول المعاملات + إجمالي القبض وإجمالي الدفع،
// بدون أي رصيد صافٍ أو ربح مكتب، حسب المواصفات المتفق عليها.
// نص عربي حقيقي قابل للتحديد والبحث (وليس صورة)، بحجم ملف صغير جداً
// بفضل تضمين حروف الخط المُستخدمة فعلياً فقط (font subsetting).
// المكتبات الثلاث تُحمَّل فقط عند الحاجة الفعلية (زر المشاركة) حتى لا تُبطئ تحميل التطبيق العادي.
export async function generateClientPdf(transactions) {
  const [{ PDFDocument, rgb }, { default: fontkit }, { render: shapeArabic }, fontBytes] = await Promise.all([
    import('pdf-lib'),
    import('@pdf-lib/fontkit'),
    import('bidi-shaper'),
    loadFontBytes(),
  ])

  const BLACK = rgb(0.12, 0.12, 0.12)
  const GREEN = rgb(0.1, 0.48, 0.3)
  const RED = rgb(0.7, 0.21, 0.18)
  const GRAY_FILL = rgb(0.95, 0.95, 0.95)
  const GRAY_LINE = rgb(0.7, 0.7, 0.7)
  const LIGHT_LINE = rgb(0.88, 0.88, 0.88)

  const pdfDoc = await PDFDocument.create()
  pdfDoc.registerFontkit(fontkit)
  const font = await pdfDoc.embedFont(fontBytes, { subset: true })

  const cols = columnBounds()
  const totalReceipts = transactions.filter((t) => t.type === 'receipt').reduce((s, t) => s + t.amount, 0)
  const totalPayments = transactions.filter((t) => t.type === 'payment').reduce((s, t) => s + t.amount, 0)
  const sorted = [...transactions].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))

  let page = pdfDoc.addPage([PAGE.width, PAGE.height])
  let yTop = PAGE.margin // مسافة من أعلى الصفحة، تُحوَّل لاحقاً لإحداثي pdf-lib (من الأسفل)

  function toPdfY(fromTop) {
    return PAGE.height - fromTop
  }

  function drawRightText(rawText, xRight, fromTopBaseline, size, color) {
    const shaped = shapeArabic(rawText)
    const width = font.widthOfTextAtSize(shaped, size)
    page.drawText(shaped, { x: xRight - width, y: toPdfY(fromTopBaseline), size, font, color })
  }

  function drawHeaderRow() {
    page.drawRectangle({
      x: PAGE.margin,
      y: toPdfY(yTop + HEADER_HEIGHT),
      width: PAGE.width - 2 * PAGE.margin,
      height: HEADER_HEIGHT,
      color: GRAY_FILL,
    })
    cols.forEach((col) => {
      drawRightText(col.label, col.xRight - 6, yTop + HEADER_HEIGHT / 2 + 4, 11, BLACK)
    })
    yTop += HEADER_HEIGHT
    page.drawLine({
      start: { x: PAGE.margin, y: toPdfY(yTop) },
      end: { x: PAGE.width - PAGE.margin, y: toPdfY(yTop) },
      thickness: 1,
      color: GRAY_LINE,
    })
  }

  function ensureSpace(needed) {
    if (yTop + needed > PAGE.height - PAGE.margin) {
      page = pdfDoc.addPage([PAGE.width, PAGE.height])
      yTop = PAGE.margin
      drawHeaderRow()
    }
  }

  drawHeaderRow()

  for (const t of sorted) {
    ensureSpace(ROW_HEIGHT)
    const baseline = yTop + ROW_HEIGHT / 2 + 3

    const dateCol = cols.find((c) => c.key === 'date')
    const dateWidth = font.widthOfTextAtSize(t.date, 10)
    page.drawText(t.date, { x: dateCol.xRight - 6 - dateWidth, y: toPdfY(baseline), size: 10, font, color: BLACK })

    if (t.description) {
      const descCol = cols.find((c) => c.key === 'description')
      const shapedDesc = shapeArabic(t.description)
      const fitted = truncateToWidth(shapedDesc, font, 10, descCol.width - 12)
      const width = font.widthOfTextAtSize(fitted, 10)
      page.drawText(fitted, { x: descCol.xRight - 6 - width, y: toPdfY(baseline), size: 10, font, color: BLACK })
    }

    const amountText = formatAmount(t.amount)
    const amountWidth = font.widthOfTextAtSize(amountText, 10)
    if (t.type === 'receipt') {
      const col = cols.find((c) => c.key === 'receipt')
      page.drawText(amountText, { x: col.xRight - 6 - amountWidth, y: toPdfY(baseline), size: 10, font, color: GREEN })
    } else {
      const col = cols.find((c) => c.key === 'payment')
      page.drawText(amountText, { x: col.xRight - 6 - amountWidth, y: toPdfY(baseline), size: 10, font, color: RED })
    }

    yTop += ROW_HEIGHT
    page.drawLine({
      start: { x: PAGE.margin, y: toPdfY(yTop) },
      end: { x: PAGE.width - PAGE.margin, y: toPdfY(yTop) },
      thickness: 0.5,
      color: LIGHT_LINE,
    })
  }

  ensureSpace(ROW_HEIGHT + 6)
  page.drawLine({
    start: { x: PAGE.margin, y: toPdfY(yTop) },
    end: { x: PAGE.width - PAGE.margin, y: toPdfY(yTop) },
    thickness: 1.2,
    color: rgb(0.24, 0.24, 0.24),
  })
  yTop += ROW_HEIGHT
  const totalsBaseline = yTop - ROW_HEIGHT / 2 + 4

  const descCol = cols.find((c) => c.key === 'description')
  drawRightText('الإجمالي', descCol.xRight - 6, totalsBaseline, 11, BLACK)

  const receiptCol = cols.find((c) => c.key === 'receipt')
  const receiptText = formatAmount(totalReceipts)
  const receiptWidth = font.widthOfTextAtSize(receiptText, 11)
  page.drawText(receiptText, { x: receiptCol.xRight - 6 - receiptWidth, y: toPdfY(totalsBaseline), size: 11, font, color: GREEN })

  const paymentCol = cols.find((c) => c.key === 'payment')
  const paymentText = formatAmount(totalPayments)
  const paymentWidth = font.widthOfTextAtSize(paymentText, 11)
  page.drawText(paymentText, { x: paymentCol.xRight - 6 - paymentWidth, y: toPdfY(totalsBaseline), size: 11, font, color: RED })

  const bytes = await pdfDoc.save()
  return new Blob([bytes], { type: 'application/pdf' })
}
