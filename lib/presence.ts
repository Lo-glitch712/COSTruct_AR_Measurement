"use client"

import { useEffect, useState } from "react"
import type { RealtimeChannel } from "@supabase/supabase-js"
import { supabase, supabaseEnabled } from "@/lib/supabase"
import type { Role, Session } from "@/lib/session"

export type OnlineUser = {
  email: string
  name: string
  role: Role
}

const TOPIC = "online-users"
const listeners = new Set<(users: OnlineUser[]) => void>()
let channel: RealtimeChannel | null = null
let lastUsers: OnlineUser[] = []

function fromSession(session: Session): OnlineUser {
  return {
    email: session.email.trim().toLowerCase(),
    name: session.name,
    role: session.role,
  }
}

function unique(users: OnlineUser[]) {
  const map = new Map<string, OnlineUser>()
  for (const user of users) {
    const email = user.email.trim().toLowerCase()
    if (!email) continue
    map.set(email, { ...user, email })
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name))
}

function fromPresence(): OnlineUser[] {
  if (!channel) return []
  const state = channel.presenceState() as Record<string, OnlineUser[]>
  const users: OnlineUser[] = []
  for (const metas of Object.values(state)) {
    for (const meta of metas) {
      if (meta?.email && meta?.name && meta?.role) users.push(meta)
    }
  }
  return unique(users)
}

function publish(extra?: OnlineUser) {
  lastUsers = unique([...fromPresence(), ...(extra ? [extra] : [])])
  for (const listener of listeners) listener(lastUsers)
}

export function startPresence(session: Session) {
  const self = fromSession(session)
  if (!supabaseEnabled) {
    publish(self)
    return () => {}
  }

  if (!channel) {
    channel = supabase.channel(TOPIC, {
      config: { presence: { key: self.email } },
    })
    channel.on("presence", { event: "sync" }, () => publish(self))
    channel.on("presence", { event: "join" }, () => publish(self))
    channel.on("presence", { event: "leave" }, () => publish(self))
    channel.subscribe(async (status) => {
      if (status !== "SUBSCRIBED") return
      await channel?.track({
        email: self.email,
        name: self.name,
        role: self.role,
      })
      publish(self)
    })
  } else {
    void channel.track({
      email: self.email,
      name: self.name,
      role: self.role,
    })
  }
  publish(self)

  return () => {
    void channel?.untrack()
  }
}

export function subscribeOnlineUsers(
  listener: (users: OnlineUser[]) => void,
  self?: Session | null,
) {
  listeners.add(listener)
  listener(unique([...lastUsers, ...(self ? [fromSession(self)] : [])]))
  return () => {
    listeners.delete(listener)
  }
}

export function useOnlineUsers(self?: Session | null) {
  const [users, setUsers] = useState<OnlineUser[]>(() =>
    unique(self ? [fromSession(self)] : []),
  )

  useEffect(
    () => subscribeOnlineUsers(setUsers, self),
    [self?.email, self?.name, self?.role],
  )

  return users
}
