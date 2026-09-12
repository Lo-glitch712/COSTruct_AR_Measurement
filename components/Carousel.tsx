"use client"

import {
  useRef,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react"

const DRAG_THRESHOLD = 6

/**
 * Horizontal strip that slides by dragging. Touch devices already pan natively,
 * so this only adds pointer dragging for mouse users. A drag that travels past
 * the threshold swallows the click so releasing over a card does not select it.
 */
export default function Carousel({
  children,
  label,
}: {
  children: ReactNode
  label: string
}) {
  const track = useRef<HTMLDivElement>(null)
  const start = useRef({ x: 0, scroll: 0 })
  const dragged = useRef(false)

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch" || !track.current) return
    start.current = { x: event.clientX, scroll: track.current.scrollLeft }
    dragged.current = false
    track.current.setPointerCapture(event.pointerId)
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const node = track.current
    if (!node || !node.hasPointerCapture(event.pointerId)) return
    const travelled = event.clientX - start.current.x
    if (Math.abs(travelled) > DRAG_THRESHOLD) dragged.current = true
    node.scrollLeft = start.current.scroll - travelled
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    track.current?.releasePointerCapture(event.pointerId)
  }

  function onClickCapture(event: MouseEvent<HTMLDivElement>) {
    if (!dragged.current) return
    event.preventDefault()
    event.stopPropagation()
    dragged.current = false
  }

  return (
    <div
      ref={track}
      className="carousel"
      role="radiogroup"
      aria-label={label}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClickCapture={onClickCapture}
    >
      {children}
    </div>
  )
}
