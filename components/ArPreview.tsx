"use client"

import Link from "next/link"
import Icon from "@/components/Icon"
import TesseractPreview from "@/components/TesseractPreview"

export default function ArPreview({ onMeasure }: { onMeasure?: () => void }) {
  return (
    <section className="ar-preview">
      <div className="ar-preview-body">
        <div className="ar-preview-copy">
          <span className="eyebrow">AR module</span>
          <h2 className="section-title">Preview the space before you measure</h2>
          <p className="muted">
            Drag the tesseract to inspect length, width, and height the way the AR
            camera locks a room in place.
          </p>
        </div>

        <TesseractPreview />
      </div>

      <div className="ar-preview-footer">
        {onMeasure ? (
          <button type="button" className="btn btn-primary" onClick={onMeasure}>
            Open AR measurement
            <Icon name="camera" size={18} />
          </button>
        ) : (
          <Link href="/measurements/setup" className="btn btn-primary">
            Open AR measurement
            <Icon name="camera" size={18} />
          </Link>
        )}
      </div>
    </section>
  )
}
