"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { clearSession, initials, type Session } from "@/lib/session"

const LINKS = [
  { href: "/supplier", label: "Supplier" },
  { href: "/measurements", label: "Measurements" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/settings", label: "Settings" },
]

export default function TopNav({ session }: { session: Session }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  function signOut() {
    clearSession()
    router.push("/")
  }

  return (
    <header className="nav">
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
          ☰
        </button>

        <nav className="nav-links" data-open={open}>
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-link"
              aria-current={pathname === link.href ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="nav-avatar"
          title={`${session.name} — sign out`}
          onClick={signOut}
        >
          {initials(session.name)}
        </button>
      </div>
    </header>
  )
}
