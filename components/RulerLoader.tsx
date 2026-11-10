"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import BlockStack from "@/components/BlockStack"

export const RULER_LOAD_MS = 3000

export default function RulerLoader({ message }: { message: string }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(
    <div className="ruler-loader" role="status" aria-live="polite">
      <BlockStack />
      <p className="ruler-loader-brand">COSTruct</p>
      <p className="ruler-loader-copy">{message}</p>
      <div className="ruler-loader-bar" aria-hidden="true">
        <span className="ruler-loader-fill" />
      </div>
    </div>,
    document.body,
  )
}

export function useRulerNav() {
  const router = useRouter()
  const [to, setTo] = useState<string | null>(null)
  const [message, setMessage] = useState("Just a moment")

  function go(href: string, nextMessage: string) {
    setMessage(nextMessage)
    setTo(href)
  }

  useEffect(() => {
    if (!to) return
    const id = window.setTimeout(() => {
      router.push(to)
    }, RULER_LOAD_MS)
    return () => window.clearTimeout(id)
  }, [to, router])

  return {
    go,
    loading: to !== null,
    overlay: to ? <RulerLoader message={message} /> : null,
  }
}
