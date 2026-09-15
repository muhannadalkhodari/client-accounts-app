import { formatAmount } from './format.js'

// يُنشئ PDF يحوي فقط جدول المعاملات + إجمالي القبض وإجمالي الدفع،
// بدون أي رصيد صافٍ أو ربح مكتب، حسب المواصفات المتفق عليها.
export async function generateClientPdf(transactions) {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ])
  const totalReceipts = transactions
    .filter((t) => t.type === 'receipt')
    .reduce((sum, t) => sum + t.amount, 0)
  const totalPayments = transactions
    .filter((t) => t.type === 'payment')
    .reduce((sum, t) => sum + t.amount, 0)

  const sorted = [...transactions].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))

  const rows = sorted
    .map(
      (t) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #ddd;">${t.date}</td>
        <td style="padding:8px;border-bottom:1px solid #ddd;">${t.description || ''}</td>
        <td style="padding:8px;border-bottom:1px solid #ddd;color:#1a7a4c;">${
          t.type === 'receipt' ? formatAmount(t.amount) : ''
        }</td>
        <td style="padding:8px;border-bottom:1px solid #ddd;color:#b3352f;">${
          t.type === 'payment' ? formatAmount(t.amount) : ''
        }</td>
      </tr>`,
    )
    .join('')

  const container = document.createElement('div')
  container.dir = 'rtl'
  container.style.position = 'fixed'
  container.style.top = '-10000px'
  container.style.left = '-10000px'
  container.style.width = '700px'
  container.style.background = '#ffffff'
  container.style.color = '#111111'
  container.style.fontFamily = 'Cairo, sans-serif'
  container.style.padding = '24px'
  container.innerHTML = `
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <thead>
        <tr style="background:#f2f2f2;">
          <th style="padding:8px;text-align:right;">التاريخ</th>
          <th style="padding:8px;text-align:right;">البيان</th>
          <th style="padding:8px;text-align:right;">قبض</th>
          <th style="padding:8px;text-align:right;">دفع</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr style="font-weight:bold;">
          <td style="padding:8px;border-top:2px solid #333;"></td>
          <td style="padding:8px;border-top:2px solid #333;">الإجمالي</td>
          <td style="padding:8px;border-top:2px solid #333;color:#1a7a4c;">${formatAmount(totalReceipts)}</td>
          <td style="padding:8px;border-top:2px solid #333;color:#b3352f;">${formatAmount(totalPayments)}</td>
        </tr>
      </tfoot>
    </table>
  `
  document.body.appendChild(container)

  try {
    const canvas = await html2canvas(container, { scale: 2, backgroundColor: '#ffffff' })
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = pageWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    const imgData = canvas.toDataURL('image/png')

    let heightLeft = imgHeight
    let position = 0
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    return pdf.output('blob')
  } finally {
    document.body.removeChild(container)
  }
}
