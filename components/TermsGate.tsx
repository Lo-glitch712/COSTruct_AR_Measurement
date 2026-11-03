"use client"

import { useEffect, useRef, useState, type UIEvent } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { signOutRemote } from "@/lib/auth"
import { useSession } from "@/lib/session"
import {
  TERMS_SECTIONS,
  TERMS_UPDATED,
  acceptTerms,
  hasAcceptedTerms,
} from "@/lib/terms"

export default function TermsGate() {
  const router = useRouter()
  const { session, loaded } = useSession()
  const [open, setOpen] = useState(false)
  const [checked, setChecked] = useState(false)
  const [reachedEnd, setReachedEnd] = useState(false)
  const [mounted, setMounted] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!loaded || !session) {
      setOpen(false)
      return
    }
    setOpen(!hasAcceptedTerms(session.email))
    setChecked(false)
    setReachedEnd(false)
  }, [loaded, session])

  useEffect(() => {
    if (!open) return
    const node = bodyRef.current
    if (node && node.scrollHeight <= node.clientHeight + 8) setReachedEnd(true)
  }, [open])

  function onScroll(event: UIEvent<HTMLDivElement>) {
    const node = event.currentTarget
    if (node.scrollTop + node.clientHeight >= node.scrollHeight - 32) {
      setReachedEnd(true)
    }
  }

  function agree() {
    if (!session || !checked || !reachedEnd) return
    acceptTerms(session.email)
    setOpen(false)
  }

  function decline() {
    void signOutRemote().then(() => router.push("/"))
  }

  if (!mounted || !open || !session) return null

  return createPortal(
    <div className="terms-scrim" role="presentation">
      <div
        className="terms-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-title"
      >
        <header className="terms-dialog-head">
          <p className="eyebrow">Required before you continue</p>
          <h2 id="terms-title">Terms and Conditions</h2>
          <p className="tiny">Last updated {TERMS_UPDATED}. Scroll to the end to agree.</p>
        </header>

        <div className="terms-dialog-body" ref={bodyRef} onScroll={onScroll}>
          {TERMS_SECTIONS.map((section) => (
            <section key={section.title} className="terms-block">
              <h3>{section.title}</h3>
              <p>{section.body}</p>
            </section>
          ))}
        </div>

        <footer className="terms-dialog-foot">
          <label className="terms-check">
            <input
              type="checkbox"
              checked={checked}
              disabled={!reachedEnd}
              onChange={(event) => setChecked(event.target.checked)}
            />
            <span>
              I have read these Terms and Conditions and I agree to follow them
              while using COSTruct.
            </span>
          </label>
          <div className="terms-dialog-actions">
            <button type="button" className="btn btn-secondary" onClick={decline}>
              Sign out
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={agree}
              disabled={!checked || !reachedEnd}
            >
              I agree
            </button>
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  )
}
