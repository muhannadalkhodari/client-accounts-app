// دوال حسابية بحتة (بدون أي اتصال بقاعدة بيانات) تُستخدم من طبقة الخدمات ومن الواجهات.
// فصلها هنا يجعل اختبارها وإعادة استخدامها أسهل.

export function computeTotals(transactions = []) {
  let totalReceipts = 0
  let totalPayments = 0
  for (const t of transactions) {
    if (t.type === 'receipt') totalReceipts += t.amount
    else if (t.type === 'payment') totalPayments += t.amount
  }
  return { totalReceipts, totalPayments }
}

// الرصيد (الخزينة) = مجموع المقبوضات - مجموع المدفوعات
export function computeBalance(transactions = []) {
  const { totalReceipts, totalPayments } = computeTotals(transactions)
  return totalReceipts - totalPayments
}

// ربح المكتب = نسبة العمولة × مجموع المدفوعات فقط (حسب المواصفات المتفق عليها)
export function computeOfficeProfit(transactions = [], commissionPercent = 0) {
  const { totalPayments } = computeTotals(transactions)
  return (commissionPercent / 100) * totalPayments
}

// أقدم تاريخ معاملة موجود حالياً في الحساب (أو null إذا لم توجد معاملات بعد)
export function getEarliestTransactionDate(transactions = []) {
  if (transactions.length === 0) return null
  return transactions.reduce(
    (min, t) => (t.date < min ? t.date : min),
    transactions[0].date,
  )
}

// الحد الأدنى المسموح لتاريخ معاملة جديدة:
// - إذا لم توجد أي معاملة بعد: لا يوجد حد أدنى (null) ويُسمح بأي تاريخ ماضٍ.
// - إذا وُجدت معاملات: لا يمكن أن يكون التاريخ أقدم من أقدم معاملة حالية.
// ملاحظة: عند حذف أو تعديل أقدم معاملة، يُعاد حساب هذا الحد تلقائياً لأنه
// يُشتق دائماً من قائمة المعاملات الحالية وليس من قيمة مخزّنة بشكل منفصل.
export function getMinAllowedDate(transactions = []) {
  return getEarliestTransactionDate(transactions)
}

// الحد الأقصى: اليوم دائماً (بصيغة YYYY-MM-DD حسب توقيت الجهاز المحلي)
export function getMaxAllowedDate() {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function isTransactionDateValid(date, transactions = []) {
  const max = getMaxAllowedDate()
  if (date > max) return false
  const min = getMinAllowedDate(transactions)
  if (min && date < min) return false
  return true
}
