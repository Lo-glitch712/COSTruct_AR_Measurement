const STORAGE_KEY = "costruct.introSeen"

export function readIntroSeen() {
  if (typeof window === "undefined") return false
  return window.localStorage.getItem(STORAGE_KEY) === "1"
}

export function markIntroSeen() {
  window.localStorage.setItem(STORAGE_KEY, "1")
}
