"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Icon from "@/components/Icon"
import AppCalc from "@/components/AppCalc"
import { CostGuideBar, openCostGuide } from "@/components/CostGuide"
import type { Session } from "@/lib/session"
import { signOutRemote } from "@/lib/auth"

const BUYER_LINKS = [
  { href: "/projects", label: "Projects" },
  { href: "/supplier", label: "Suppliers" },
  { href: "/about", label: "About" },
  { href: "/settings", label: "Settings" },
]

/** A supplier manages their catalog on the dashboard, so /home is enough. */
const SUPPLIER_LINKS = [
  { href: "/home", label: "Dashboard" },
  { href: "/about", label: "About" },
  { href: "/settings", label: "Settings" },
]

const ADMIN_LINKS = [
  { href: "/home", label: "Monitor" },
  { href: "/about", label: "About" },
  { href: "/settings", label: "Settings" },
]

export default function TopNav({ session }: { session: Session }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [mounted, setMounted] = useState(false)
  const links =
    session.role === "admin"
      ? ADMIN_LINKS
      : session.role === "supplier"
        ? SUPPLIER_LINKS
        : BUYER_LINKS

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  function askSignOut() {
    setOpen(false)
    setConfirming(true)
  }

  function signOut() {
    setConfirming(false)
    void signOutRemote().then(() => router.push("/"))
  }

  function renderLinks() {
    return links.map((link) => (
      <Link
        key={link.href}
        href={link.href}
        className="nav-link"
        aria-current={pathname === link.href ? "page" : undefined}
        onClick={() => setOpen(false)}
      >
        {link.label}
      </Link>
    ))
  }

  return (
    <header className="nav">
      <div className="nav-glass">
        <div className="container nav-inner">
          <Link href="/home" className="nav-brand" onClick={() => setOpen(false)}>
            COSTruct
          </Link>

          <button
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            aria-label="Toggle navigation"
            onClick={() => setOpen((value) => !value)}
          >
            <Icon name="menu" size={20} />
          </button>

          <nav className="nav-links">
            {renderLinks()}
            <button type="button" className="nav-link" onClick={askSignOut}>
              Log out
            </button>
          </nav>

          {session.role === "buyer" ? (
            <button
              type="button"
              className="nav-calc"
              title="Cost guide"
              aria-label="Cost guide"
              onClick={() => openCostGuide("answer")}
            >
              <Icon name="guide" size={18} />
            </button>
          ) : null}

          <AppCalc />
        </div>
      </div>

      {open ? (
        <button
          type="button"
          className="nav-scrim"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <nav className="nav-drawer" data-open={open ? "true" : "false"} aria-label="Menu">
        {renderLinks()}
        {session.role === "buyer" ? (
          <button
            type="button"
            className="nav-link"
            onClick={() => {
              setOpen(false)
              openCostGuide("answer")
            }}
          >
            Cost guide
          </button>
        ) : null}
        <button type="button" className="nav-link nav-logout" onClick={askSignOut}>
          Log out
        </button>
      </nav>

      {session.role === "buyer" ? <CostGuideBar /> : null}

      {mounted && confirming
        ? createPortal(
            <div
              className="logout-scrim"
              role="presentation"
              onClick={() => setConfirming(false)}
            >
              <div
                className="logout-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="logout-title"
                onClick={(event) => event.stopPropagation()}
              >
                <h2 id="logout-title" className="section-title">
                  Log out?
                </h2>
                <p className="muted" style={{ fontSize: 14 }}>
                  You’ll need to sign in again to get back to your account.
                </p>
                <div className="logout-dialog-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setConfirming(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={signOut}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </header>
  )
}
