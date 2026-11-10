import { quantity, type MaterialLine } from "@/lib/estimate"

export type EstimatePdfComponent = {
  name: string
  dimensions: { length: number; width: number; height: number }
  cost: number
  lines: MaterialLine[]
}

export type EstimatePdfInput = {
  name: string
  address?: string
  description?: string
  dateLabel: string
  supplierName?: string
  componentCount: number
  components: EstimatePdfComponent[]
  total: number
}

const PAGE_W = 595.28
const PAGE_H = 841.89
const MARGIN = 48
const CONTENT_W = PAGE_W - MARGIN * 2
const ACCENT: [number, number, number] = [0.071, 0.149, 0.227]
const MUTED: [number, number, number] = [0.4, 0.4, 0.45]

export function pdfFilename(name: string) {
  const slug =
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "project"
  return `COSTruct-${slug}-estimate.pdf`
}

function php(value: number) {
  return `PHP ${value.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function normalize(text: string) {
  return text
    .replaceAll("₱", "PHP ")
    .replaceAll("—", "-")
    .replaceAll("–", "-")
    .replaceAll("×", "x")
    .replaceAll("³", "3")
    .replaceAll("\u00a0", " ")
    .replaceAll("\r", " ")
    .replaceAll("\n", " ")
}

function charWidth(ch: string, bold: boolean) {
  if (ch === " ") return 0.278
  if ("iIlj.,;:'`|!".includes(ch)) return bold ? 0.3 : 0.278
  if ("mwMW@".includes(ch)) return bold ? 0.889 : 0.833
  return bold ? 0.667 : 0.556
}

function measure(text: string, fontSize: number, bold: boolean) {
  let width = 0
  for (const ch of normalize(text)) width += charWidth(ch, bold) * fontSize
  return width
}

function wrapText(text: string, maxWidth: number, fontSize: number, bold: boolean) {
  const words = normalize(text).split(/\s+/).filter(Boolean)
  if (words.length === 0) return []
  const lines: string[] = []
  let line = ""

  const splitToken = (token: string) => {
    let rest = token
    while (measure(rest, fontSize, bold) > maxWidth && rest.length > 1) {
      let cut = rest.length - 1
      while (cut > 1 && measure(rest.slice(0, cut), fontSize, bold) > maxWidth) {
        cut -= 1
      }
      lines.push(rest.slice(0, cut))
      rest = rest.slice(cut)
    }
    line = rest
  }

  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (measure(next, fontSize, bold) <= maxWidth) line = next
    else {
      if (line) lines.push(line)
      if (measure(word, fontSize, bold) > maxWidth) splitToken(word)
      else line = word
    }
  }
  if (line) lines.push(line)
  return lines
}

function encodePdfString(text: string) {
  let out = "("
  for (const ch of normalize(text)) {
    const code = ch.charCodeAt(0)
    if (ch === "\\" || ch === "(" || ch === ")") out += `\\${ch}`
    else if (code < 32 || code > 126) out += `\\${code.toString(8).padStart(3, "0")}`
    else out += ch
  }
  return `${out})`
}

type PdfText = {
  text: string
  x: number
  y: number
  size: number
  bold?: boolean
  color?: [number, number, number]
}

class PdfDoc {
  pages: { texts: PdfText[]; rules: number[] }[] = [{ texts: [], rules: [] }]
  y = PAGE_H - MARGIN

  current() {
    return this.pages[this.pages.length - 1]
  }

  addPage() {
    this.pages.push({ texts: [], rules: [] })
    this.y = PAGE_H - MARGIN
  }

  ensure(height: number) {
    if (this.y - height < MARGIN + 28) this.addPage()
  }

  text(
    value: string,
    x: number,
    size: number,
    opts?: { bold?: boolean; color?: [number, number, number]; gap?: number },
  ) {
    this.current().texts.push({
      text: value,
      x,
      y: this.y,
      size,
      bold: opts?.bold,
      color: opts?.color,
    })
    this.y -= opts?.gap ?? size + 4
  }

  rule() {
    this.current().rules.push(this.y + 6)
    this.y -= 12
  }
}

function pageStream(page: PdfDoc["pages"][number], pageIndex: number, pageCount: number) {
  const bits: string[] = []
  bits.push("0.75 0.75 0.75 RG 0.4 w")
  bits.push(
    `${MARGIN.toFixed(2)} ${(MARGIN - 8).toFixed(2)} m ${(PAGE_W - MARGIN).toFixed(2)} ${(MARGIN - 8).toFixed(2)} l S`,
  )
  bits.push("0.45 0.45 0.45 rg")
  bits.push(
    `BT /F1 8 Tf ${MARGIN.toFixed(2)} ${(MARGIN - 20).toFixed(2)} Td ${encodePdfString("COSTruct project estimate")} Tj ET`,
  )
  const pageLabel = `Page ${pageIndex + 1} of ${pageCount}`
  const pageX = PAGE_W - MARGIN - measure(pageLabel, 8, false)
  bits.push(
    `BT /F1 8 Tf ${pageX.toFixed(2)} ${(MARGIN - 20).toFixed(2)} Td ${encodePdfString(pageLabel)} Tj ET`,
  )

  for (const y of page.rules) {
    bits.push(
      `0.78 0.78 0.78 RG 0.6 w ${MARGIN.toFixed(2)} ${y.toFixed(2)} m ${(PAGE_W - MARGIN).toFixed(2)} ${y.toFixed(2)} l S`,
    )
  }
  for (const line of page.texts) {
    const [r, g, b] = line.color ?? ACCENT
    const font = line.bold ? "F2" : "F1"
    bits.push(`${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg`)
    bits.push(
      `BT /${font} ${line.size} Tf ${line.x.toFixed(2)} ${line.y.toFixed(2)} Td ${encodePdfString(line.text)} Tj ET`,
    )
  }
  return bits.join("\n")
}

function assemble(streams: string[]) {
  const encoder = new TextEncoder()
  const parts: Uint8Array[] = []
  let offset = 0
  const offsets: number[] = []

  const emitBytes = (bytes: Uint8Array) => {
    parts.push(bytes)
    offset += bytes.length
  }
  const emit = (text: string) => emitBytes(encoder.encode(text))

  emit("%PDF-1.4\n%")
  emitBytes(new Uint8Array([0x80, 0x81, 0x82, 0x83, 0x0a]))

  const pageObjectIds = streams.map((_, index) => 6 + index * 2)
  const objects: string[] = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Count ${streams.length} /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
  ]

  streams.forEach((content, index) => {
    const contentId = 5 + index * 2
    objects.push(`<< /Length ${encoder.encode(content).length} >>\nstream\n${content}\nendstream`)
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`,
    )
  })

  objects.forEach((body, index) => {
    offsets[index] = offset
    emit(`${index + 1} 0 obj\n${body}\nendobj\n`)
  })

  const xrefAt = offset
  emit(`xref\n0 ${objects.length + 1}\n`)
  emit("0000000000 65535 f \n")
  for (const objectOffset of offsets) {
    emit(`${String(objectOffset).padStart(10, "0")} 00000 n \n`)
  }
  emit(`trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefAt}\n%%EOF\n`)

  const out = new Uint8Array(offset)
  let cursor = 0
  for (const part of parts) {
    out.set(part, cursor)
    cursor += part.length
  }
  return out
}

function drawHeader(doc: PdfDoc, input: EstimatePdfInput) {
  doc.y -= 8
  doc.text("COSTruct", MARGIN, 11, { bold: true, color: ACCENT, gap: 16 })
  doc.text("Project estimate", MARGIN, 22, { bold: true, color: ACCENT, gap: 16 })
  doc.text("Material quantities and cost for every component you measured.", MARGIN, 10, {
    color: MUTED,
    gap: 18,
  })
  doc.rule()

  const title = input.name.trim() || "Untitled project"
  doc.text(title, MARGIN, 16, { bold: true, color: ACCENT, gap: 14 })

  const meta = [
    input.dateLabel,
    `${input.componentCount} component${input.componentCount === 1 ? "" : "s"}`,
    input.supplierName,
  ]
    .filter(Boolean)
    .join("  ·  ")
  for (const line of wrapText(meta, CONTENT_W, 10, false)) {
    doc.text(line, MARGIN, 10, { color: MUTED, gap: 13 })
  }

  if (input.address?.trim()) {
    for (const line of wrapText(input.address.trim(), CONTENT_W, 10, false)) {
      doc.text(line, MARGIN, 10, { color: MUTED, gap: 13 })
    }
  }
  if (input.description?.trim()) {
    for (const line of wrapText(input.description.trim(), CONTENT_W, 10, false)) {
      doc.text(line, MARGIN, 10, { color: MUTED, gap: 13 })
    }
  }

  doc.y -= 4
  doc.text("Estimated total", MARGIN, 9, { color: MUTED, gap: 0 })
  const totalText = php(input.total)
  doc.text(totalText, PAGE_W - MARGIN - measure(totalText, 16, true), 16, {
    bold: true,
    color: ACCENT,
    gap: 22,
  })
  doc.rule()
}

function drawComponents(doc: PdfDoc, input: EstimatePdfInput) {
  const costCol = PAGE_W - MARGIN
  const qtyCol = costCol - 168

  for (const component of input.components) {
    doc.ensure(72)
    doc.text(component.name, MARGIN, 12, { bold: true, color: ACCENT, gap: 4 })
    const dim = `${quantity(component.dimensions.length)} x ${quantity(component.dimensions.width)} x ${quantity(component.dimensions.height)} m`
    doc.text(dim, MARGIN, 9, { color: MUTED, gap: 0 })
    const componentCost = php(component.cost)
    doc.text(componentCost, costCol - measure(componentCost, 11, true), 11, {
      bold: true,
      color: ACCENT,
      gap: 16,
    })

    for (const line of component.lines) {
      doc.ensure(16)
      const qty = `${quantity(line.quantity)} ${normalize(line.unit)} x ${php(line.unitPrice)}`
      const cost = php(line.cost)
      const nameWidth = qtyCol - MARGIN - 12 - measure(qty, 9, false)
      const names = wrapText(line.material, Math.max(120, nameWidth), 9, false)
      names.forEach((nameLine, index) => {
        doc.text(nameLine, MARGIN, 9, {
          color: ACCENT,
          gap: index === names.length - 1 ? 0 : 12,
        })
      })
      doc.text(qty, qtyCol - measure(qty, 9, false), 9, { color: MUTED, gap: 0 })
      doc.text(cost, costCol - measure(cost, 9, false), 9, { color: ACCENT, gap: 13 })
    }
    doc.y -= 8
  }

  doc.ensure(56)
  doc.rule()
  doc.text("ESTIMATED TOTAL", MARGIN, 10, { bold: true, color: MUTED, gap: 0 })
  const grand = php(input.total)
  doc.text(grand, costCol - measure(grand, 16, true), 16, {
    bold: true,
    color: ACCENT,
    gap: 22,
  })

  const note =
    "Quantities are estimated from the dimensions you entered or measured in AR. These are planning figures only. Verify them against your project specifications before buying. Pickup prices; no tax or delivery is added."
  for (const line of wrapText(note, CONTENT_W, 8, false)) {
    doc.text(line, MARGIN, 8, { color: MUTED, gap: 11 })
  }
}

export function estimatePdfBytes(input: EstimatePdfInput) {
  const doc = new PdfDoc()
  drawHeader(doc, input)
  drawComponents(doc, input)
  const streams = doc.pages.map((page, index) => pageStream(page, index, doc.pages.length))
  return assemble(streams)
}

export function downloadEstimatePdf(input: EstimatePdfInput) {
  const bytes = estimatePdfBytes(input)
  const blob = new Blob([bytes], { type: "application/pdf" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = pdfFilename(input.name)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
