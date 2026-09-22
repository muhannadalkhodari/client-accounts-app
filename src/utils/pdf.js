import { formatAmount } from './format.js'

const FONT_URL = `${import.meta.env.BASE_URL}fonts/Amiri-Regular.ttf`
let cachedFontBase64 = null

function arrayBufferToBase64(buffer) {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}

async function loadFontBase64() {
  if (cachedFontBase64) return cachedFontBase64
  const res = await fetch(FONT_URL)
  if (!res.ok) throw new Error('تعذّر تحميل خط PDF')
  const buffer = await res.arrayBuffer()
  cachedFontBase64 = arrayBufferToBase64(buffer)
  return cachedFontBase64
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

let shaperInstalled = false

// يُنشئ PDF يحوي فقط جدول المعاملات + إجمالي القبض وإجمالي الدفع،
// بدون أي رصيد صافٍ أو ربح مكتب، حسب المواصفات المتفق عليها.
// نص عربي حقيقي قابل للتحديد والبحث (وليس صورة)، بحجم ملف أصغر بكثير.
//
// معالجة العربية (تشكيل الحروف + ترتيبها البصري الصحيح) تتم عبر مكتبة
// "bidi-shaper" المخصصة لهذا الغرض بالضبط مع jsPDF، بدل تنفيذ ذلك يدوياً،
// لتقليل احتمال الأخطاء الدقيقة في هذا الجزء الحسّاس.
export async function generateClientPdf(transactions) {
  const [{ default: jsPDF }, { installJsPdfShaper }, fontBase64] = await Promise.all([
    import('jspdf'),
    import('bidi-shaper/jspdf'),
    loadFontBase64(),
  ])

  if (!shaperInstalled) {
    installJsPdfShaper(jsPDF.API)
    shaperInstalled = true
  }

  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  doc.addFileToVFS('Amiri-Regular.ttf', fontBase64)
  doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal')
  doc.setFont('Amiri', 'normal')

  const cols = columnBounds()
  const totalReceipts = transactions.filter((t) => t.type === 'receipt').reduce((s, t) => s + t.amount, 0)
  const totalPayments = transactions.filter((t) => t.type === 'payment').reduce((s, t) => s + t.amount, 0)
  const sorted = [...transactions].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))

  let y = PAGE.margin

  function drawHeaderRow() {
    doc.setFillColor(242, 242, 242)
    doc.rect(PAGE.margin, y, PAGE.width - 2 * PAGE.margin, HEADER_HEIGHT, 'F')
    doc.setFontSize(11)
    doc.setTextColor(30, 30, 30)
    cols.forEach((col) => {
      doc.text(col.label, col.xRight - 6, y + HEADER_HEIGHT / 2 + 4, { align: 'right' })
    })
    y += HEADER_HEIGHT
    doc.setDrawColor(180, 180, 180)
    doc.line(PAGE.margin, y, PAGE.width - PAGE.margin, y)
  }

  function ensureSpace(needed) {
    if (y + needed > PAGE.height - PAGE.margin) {
      doc.addPage()
      y = PAGE.margin
      drawHeaderRow()
    }
  }

  drawHeaderRow()
  doc.setFontSize(10)

  for (const t of sorted) {
    ensureSpace(ROW_HEIGHT)
    const rowY = y + ROW_HEIGHT / 2 + 3

    const dateCol = cols.find((c) => c.key === 'date')
    doc.setTextColor(30, 30, 30)
    doc.text(t.date, dateCol.xRight - 6, rowY, { align: 'right' })

    if (t.description) {
      const descCol = cols.find((c) => c.key === 'description')
      const truncated = doc.splitTextToSize(t.description, descCol.width - 12)[0]
      doc.text(truncated, descCol.xRight - 6, rowY, { align: 'right' })
    }

    if (t.type === 'receipt') {
      const col = cols.find((c) => c.key === 'receipt')
      doc.setTextColor(26, 122, 76)
      doc.text(formatAmount(t.amount), col.xRight - 6, rowY, { align: 'right' })
    } else {
      const col = cols.find((c) => c.key === 'payment')
      doc.setTextColor(179, 53, 47)
      doc.text(formatAmount(t.amount), col.xRight - 6, rowY, { align: 'right' })
    }

    y += ROW_HEIGHT
    doc.setDrawColor(225, 225, 225)
    doc.line(PAGE.margin, y, PAGE.width - PAGE.margin, y)
  }

  ensureSpace(ROW_HEIGHT + 6)
  doc.setDrawColor(60, 60, 60)
  doc.setLineWidth(1.2)
  doc.line(PAGE.margin, y, PAGE.width - PAGE.margin, y)
  doc.setLineWidth(0.5)
  y += ROW_HEIGHT

  doc.setFontSize(11)
  const descCol = cols.find((c) => c.key === 'description')
  doc.setTextColor(30, 30, 30)
  doc.text('الإجمالي', descCol.xRight - 6, y - ROW_HEIGHT / 2 + 4, { align: 'right' })

  const receiptCol = cols.find((c) => c.key === 'receipt')
  doc.setTextColor(26, 122, 76)
  doc.text(formatAmount(totalReceipts), receiptCol.xRight - 6, y - ROW_HEIGHT / 2 + 4, { align: 'right' })

  const paymentCol = cols.find((c) => c.key === 'payment')
  doc.setTextColor(179, 53, 47)
  doc.text(formatAmount(totalPayments), paymentCol.xRight - 6, y - ROW_HEIGHT / 2 + 4, { align: 'right' })

  return doc.output('blob')
}
