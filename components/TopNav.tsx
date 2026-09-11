"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Icon from "@/components/Icon"
import { clearSession, initials, type Session } from "@/lib/session"

const BUYER_LINKS = [
  { href: "/measurements", label: "Measurements" },
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

export default function TopNav({ session }: { session: Session }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const links = session.role === "supplier" ? SUPPLIER_LINKS : BUYER_LINKS

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
          <Icon name="menu" size={20} />
        </button>

        <nav className="nav-links" data-open={open}>
          {links.map((link) => (
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
