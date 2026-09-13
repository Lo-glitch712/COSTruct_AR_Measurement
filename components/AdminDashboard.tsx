"use client"

import { useEffect, useRef, useState } from "react"
import Icon from "@/components/Icon"
import { buyers, removeAccount, suppliers, type Account } from "@/lib/accounts"
import { deleteAccountRemote, fetchProfiles } from "@/lib/auth"
import { readCatalog } from "@/lib/catalog"
import { peso } from "@/lib/estimate"
import {
  fetchRemoteProjects,
  readProjects,
  type SavedProject,
} from "@/lib/project"
import type { Session } from "@/lib/session"
import { supplierById } from "@/lib/suppliers"

type Tab = "buyers" | "suppliers"

function toAccount(profile: Session & { id?: string }): Account {
  return {
    id: profile.id ?? profile.email,
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    password: "",
    role: profile.role,
    supplierId: profile.supplierId,
    createdAt: "",
    profileId: profile.id,
    firstName: profile.firstName,
    middleName: profile.middleName,
    lastName: profile.lastName,
    birthday: profile.birthday,
    street: profile.street,
    city: profile.city,
    province: profile.province,
    zipCode: profile.zipCode,
  }
}

export default function AdminDashboard({ session }: { session: Session }) {
  const [tab, setTab] = useState<Tab>("buyers")
  const [openId, setOpenId] = useState<string | null>(null)
  const [armed, setArmed] = useState<string | null>(null)
  const [pressed, setPressed] = useState<string | null>(null)
  const [buyerAccounts, setBuyerAccounts] = useState<Account[]>(buyers())
  const [supplierAccounts, setSupplierAccounts] = useState<Account[]>(suppliers())
  const [projects, setProjects] = useState<SavedProject[]>(readProjects())
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const pressTimer = useRef<number | null>(null)
  const holdFired = useRef(false)

  useEffect(() => {
    void fetchProfiles().then((profiles) => {
      if (profiles.length === 0) return
      setBuyerAccounts(
        profiles.filter((profile) => profile.role === "buyer").map(toAccount),
      )
      setSupplierAccounts(
        profiles
          .filter((profile) => profile.role === "supplier")
          .map(toAccount),
      )
    })
    void fetchRemoteProjects().then((remote) => {
      if (remote.length) setProjects(remote)
    })
  }, [])

  function clearPress() {
    if (pressTimer.current !== null) {
      window.clearTimeout(pressTimer.current)
      pressTimer.current = null
    }
  }

  function startPress(id: string) {
    clearPress()
    holdFired.current = false
    setPressed(id)
    pressTimer.current = window.setTimeout(() => {
      holdFired.current = true
      setArmed(id)
    }, 450)
  }

  function endPress() {
    clearPress()
    setPressed(null)
  }

  useEffect(() => {
    if (!armed) return
    function onPointerDown(event: Event) {
      const target = event.target as HTMLElement | null
      if (target?.closest("[data-armed='true']")) return
      setArmed(null)
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [armed])

  function toggleOpen(account: Account) {
    if (holdFired.current || armed === account.id) return
    setOpenId((current) => (current === account.id ? null : account.id))
    setError("")
  }

  async function remove(account: Account) {
    if (account.role === "admin") return
    const label = account.role === "supplier" ? "supplier" : "buyer"
    if (
      !window.confirm(
        `Remove ${account.name} (${account.email})? This ${label} will no longer be able to sign in.`,
      )
    ) {
      return
    }

    setBusy(true)
    setError("")
    try {
      if (account.profileId && !account.profileId.includes("@")) {
        await deleteAccountRemote(account.profileId)
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Removed locally. Run the admin delete SQL if it should also leave Supabase.",
      )
    }
    removeAccount(account.email)
    setBuyerAccounts((current) =>
      current.filter((entry) => entry.email !== account.email),
    )
    setSupplierAccounts((current) =>
      current.filter((entry) => entry.email !== account.email),
    )
    if (openId === account.id) setOpenId(null)
    setArmed(null)
    setBusy(false)
  }

  const accounts = tab === "buyers" ? buyerAccounts : supplierAccounts
  const firstName = session.name.split(" ")[0]

  return (
    <>
      <section className="hero">
        <span className="eyebrow">Admin</span>
        <h1 className="hero-title">Welcome, {firstName}.</h1>
        <p className="hero-full-title">
          Tap a card to expand it. Hold an account to remove it.
        </p>
      </section>

      <section className="grid grid-3">
        <div className="stat">
          <div className="stat-value">{buyerAccounts.length}</div>
          <div className="stat-label">Buyer accounts</div>
        </div>
        <div className="stat">
          <div className="stat-value">{supplierAccounts.length}</div>
          <div className="stat-label">Supplier accounts</div>
        </div>
        <div className="stat">
          <div className="stat-value">{projects.length}</div>
          <div className="stat-label">Saved projects</div>
        </div>
      </section>

      <div className="segmented" role="tablist" aria-label="Account lists">
        <button
          type="button"
          role="tab"
          className="segment"
          aria-selected={tab === "buyers"}
          onClick={() => {
            setTab("buyers")
            setOpenId(null)
            setArmed(null)
          }}
        >
          BUYERS
        </button>
        <button
          type="button"
          role="tab"
          className="segment"
          aria-selected={tab === "suppliers"}
          onClick={() => {
            setTab("suppliers")
            setOpenId(null)
            setArmed(null)
          }}
        >
          SUPPLIERS
        </button>
      </div>

      {error ? <p className="notice-error">{error}</p> : null}

      <section className="grid grid-2">
        {accounts.map((account) => {
          const opened = openId === account.id
          const buyerProjects = projects.filter(
            (project) =>
              project.ownerEmail?.toLowerCase() === account.email.toLowerCase(),
          )
          return (
            <article
              key={account.id}
              className="card admin-account"
              data-open={opened}
              data-armed={armed === account.id}
              data-pressed={pressed === account.id}
              onPointerDown={() => startPress(account.id)}
              onPointerUp={endPress}
              onPointerCancel={endPress}
              onPointerLeave={endPress}
              onContextMenu={(event) => event.preventDefault()}
              onClick={() => toggleOpen(account)}
            >
              <div className="card-head">
                <span className="card-icon">
                  <Icon
                    name={account.role === "supplier" ? "store" : "folder"}
                    size={20}
                  />
                </span>
                <h3>{account.name}</h3>
              </div>
              <p>{account.email}</p>
              <p>
                {account.phone || "No contact number"}
                {account.supplierId
                  ? ` · ${supplierById(account.supplierId)?.town ?? ""}`
                  : ""}
              </p>

              {armed === account.id ? (
                <div className="admin-account-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={busy}
                    onClick={(event) => {
                      event.stopPropagation()
                      void remove(account)
                    }}
                  >
                    {busy ? "Removing…" : "Remove account"}
                  </button>
                </div>
              ) : null}

              {opened ? (
                <div
                  className="admin-account-body"
                  onClick={(event) => event.stopPropagation()}
                >
                  {account.role === "buyer" ? (
                    <>
                      <BuyerDetails account={account} />
                      <BuyerProjects projects={buyerProjects} />
                    </>
                  ) : (
                    <SupplierMaterials
                      store={
                        supplierById(account.supplierId)?.name ?? account.name
                      }
                      items={
                        account.supplierId
                          ? readCatalog(account.supplierId)
                          : []
                      }
                    />
                  )}
                </div>
              ) : null}
            </article>
          )
        })}
      </section>

      {tab === "buyers" && buyerAccounts.length === 0 ? (
        <p className="muted">
          No buyer accounts yet. They appear here after someone uses Create an
          account.
        </p>
      ) : null}
    </>
  )
}

function BuyerDetails({ account }: { account: Account }) {
  const address = [account.street, account.city, account.province, account.zipCode]
    .filter(Boolean)
    .join(", ")
  if (!account.firstName && !account.birthday && !address) return null
  return (
    <div className="list" style={{ marginTop: 16 }}>
      {account.firstName || account.lastName ? (
        <div className="list-row">
          <span className="list-row-title">Full name</span>
          <span className="list-row-value">
            {[account.firstName, account.middleName, account.lastName]
              .filter(Boolean)
              .join(" ")}
          </span>
        </div>
      ) : null}
      {account.birthday ? (
        <div className="list-row">
          <span className="list-row-title">Birthday</span>
          <span className="list-row-value">{account.birthday}</span>
        </div>
      ) : null}
      {address ? (
        <div className="list-row">
          <span className="list-row-title">Address</span>
          <span className="list-row-value">{address}</span>
        </div>
      ) : null}
    </div>
  )
}

function BuyerProjects({ projects }: { projects: SavedProject[] }) {
  if (projects.length === 0) {
    return (
      <p className="muted" style={{ marginTop: 14 }}>
        This buyer has not saved a project yet.
      </p>
    )
  }

  return (
    <div className="list" style={{ marginTop: 16 }}>
      {projects.map((project) => {
        const store = supplierById(project.supplierId)
        return (
          <div key={project.id} className="list-row">
            <div>
              <div className="list-row-title">
                {project.name.trim() || "Untitled project"}
              </div>
              <div className="tiny">
                {store?.name ?? "No hardware selected"} ·{" "}
                {project.components.length} components
              </div>
            </div>
            <span className="list-row-value">{peso(project.total)}</span>
          </div>
        )
      })}
    </div>
  )
}

function SupplierMaterials({
  store,
  items,
}: {
  store: string
  items: { name: string; price: number; unit: string; stock: boolean }[]
}) {
  return (
    <>
      <p className="muted" style={{ marginTop: 12, fontSize: 14 }}>
        Materials listed for {store}.
      </p>
      <div className="supplier-catalog">
        {items.map((item) => (
          <div key={item.name} className="catalog-row">
            <span>
              {item.name}
              {!item.stock ? " · Out of stock" : ""}
            </span>
            <span className="catalog-price">
              {peso(item.price)}
              <small> / {item.unit}</small>
            </span>
          </div>
        ))}
      </div>
    </>
  )
}
