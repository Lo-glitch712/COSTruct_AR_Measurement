"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import Icon from "@/components/Icon"

const FACES = ["front", "back", "right", "left", "top", "bottom"] as const

const SAMPLE = {
  length: "4.20 m",
  width: "3.10 m",
  height: "2.80 m",
}

export default function ArPreview() {
  const sceneRef = useRef<HTMLDivElement>(null)
  const rot = useRef({ x: -22, y: 36 })
  const drag = useRef<{
    active: boolean
    lastX: number
    lastY: number
    pointerId: number | null
  }>({ active: false, lastX: 0, lastY: 0, pointerId: null })

  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return

    const apply = () => {
      scene.style.transform = `rotateX(${rot.current.x}deg) rotateY(${rot.current.y}deg)`
    }
    apply()

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let frame = 0
    const tick = () => {
      if (!drag.current.active && !reduced) {
        rot.current.y += 0.28
        apply()
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  function applyNow() {
    const scene = sceneRef.current
    if (!scene) return
    scene.style.transform = `rotateX(${rot.current.x}deg) rotateY(${rot.current.y}deg)`
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 && event.pointerType === "mouse") return
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = {
      active: true,
      lastX: event.clientX,
      lastY: event.clientY,
      pointerId: event.pointerId,
    }
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current.active || drag.current.pointerId !== event.pointerId) return
    const dx = event.clientX - drag.current.lastX
    const dy = event.clientY - drag.current.lastY
    drag.current.lastX = event.clientX
    drag.current.lastY = event.clientY
    rot.current.y += dx * 0.45
    rot.current.x = Math.max(-68, Math.min(68, rot.current.x - dy * 0.45))
    applyNow()
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (drag.current.pointerId === event.pointerId) {
      drag.current.active = false
      drag.current.pointerId = null
    }
  }

  return (
    <section className="ar-preview">
      <div className="ar-preview-copy">
        <span className="eyebrow">AR module</span>
        <h2 className="section-title">Preview the space before you measure</h2>
        <p className="muted">
          Drag the tesseract to inspect length, width, and height the way the AR
          camera locks a room in place.
        </p>
        <Link href="/measurements" className="btn btn-primary">
          Open AR measurement
          <Icon name="camera" size={18} />
        </Link>
      </div>

      <div
        className="ar-stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="img"
        aria-label="Rotatable AR cube preview with length, width, and height"
      >
        <div className="ar-stage-glow" />
        <div className="ar-scene" ref={sceneRef}>
          <div className="ar-floor" />
          <div className="ar-cube ar-cube-outer">
            {FACES.map((face) => (
              <div key={`outer-${face}`} className="ar-face" data-face={face} />
            ))}
          </div>
          <div className="ar-cube ar-cube-inner">
            {FACES.map((face) => (
              <div key={`inner-${face}`} className="ar-face" data-face={face} />
            ))}
          </div>
          <div className="ar-dim ar-dim-l">
            <span>L</span> {SAMPLE.length}
          </div>
          <div className="ar-dim ar-dim-w">
            <span>W</span> {SAMPLE.width}
          </div>
          <div className="ar-dim ar-dim-h">
            <span>H</span> {SAMPLE.height}
          </div>
        </div>
        <p className="ar-stage-hint">Drag to rotate</p>
      </div>
    </section>
  )
}
