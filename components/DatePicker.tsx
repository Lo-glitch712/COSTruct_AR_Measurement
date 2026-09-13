"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Icon from "@/components/Icon"

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

function parseISO(value: string) {
  if (!value) return null
  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

function toISO(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function formatDisplay(value: string) {
  const date = parseISO(value)
  if (!date) return ""
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

export default function DatePicker({
  id,
  value,
  onChange,
  minYear = 1950,
}: {
  id?: string
  value: string
  onChange: (next: string) => void
  minYear?: number
}) {
  const selected = parseISO(value)
  const today = new Date()
  const maxYear = today.getFullYear()
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<"days" | "years">("days")
  const [cursor, setCursor] = useState(() => selected ?? new Date(2000, 0, 1))
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    setView("days")
    setCursor(selected ?? new Date(2000, 0, 1))
  }, [open, selected])

  useEffect(() => {
    if (!open) return
    function close(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [open])

  const cells = useMemo(() => {
    const year = cursor.getFullYear()
    const month = cursor.getMonth()
    const first = new Date(year, month, 1).getDay()
    const count = daysInMonth(year, month)
    const blanks = Array.from({ length: first }, () => null)
    const days = Array.from({ length: count }, (_, index) => index + 1)
    return [...blanks, ...days]
  }, [cursor])

  const years = useMemo(() => {
    const list: number[] = []
    for (let year = maxYear; year >= minYear; year -= 1) list.push(year)
    return list
  }, [maxYear, minYear])

  function pickDay(day: number) {
    onChange(toISO(new Date(cursor.getFullYear(), cursor.getMonth(), day)))
    setOpen(false)
  }

  function shiftMonth(delta: number) {
    setCursor((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1))
  }

  return (
    <div className="date-picker" ref={root}>
      <button
        id={id}
        type="button"
        className="input date-picker-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span data-empty={!value}>{formatDisplay(value) || "Select birthday"}</span>
      </button>

      {open ? (
        <div className="date-picker-pop" role="dialog" aria-label="Choose birthday">
          <div className="date-picker-head">
            {view === "days" ? (
              <>
                <button
                  type="button"
                  className="date-picker-nav"
                  aria-label="Previous month"
                  onClick={() => shiftMonth(-1)}
                >
                  <Icon name="arrowLeft" size={16} />
                </button>
                <button
                  type="button"
                  className="date-picker-title"
                  onClick={() => setView("years")}
                >
                  {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
                </button>
                <button
                  type="button"
                  className="date-picker-nav"
                  aria-label="Next month"
                  onClick={() => shiftMonth(1)}
                >
                  <Icon name="arrowRight" size={16} />
                </button>
              </>
            ) : (
              <button
                type="button"
                className="date-picker-title"
                onClick={() => setView("days")}
              >
                Choose year
              </button>
            )}
          </div>

          {view === "days" ? (
            <>
              <div className="date-picker-week">
                {WEEKDAYS.map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
              <div className="date-picker-grid">
                {cells.map((day, index) =>
                  day ? (
                    <button
                      key={`${cursor.getFullYear()}-${cursor.getMonth()}-${day}`}
                      type="button"
                      className="date-picker-day"
                      data-selected={
                        selected?.getFullYear() === cursor.getFullYear() &&
                        selected.getMonth() === cursor.getMonth() &&
                        selected.getDate() === day
                      }
                      onClick={() => pickDay(day)}
                    >
                      {day}
                    </button>
                  ) : (
                    <span key={`empty-${index}`} />
                  ),
                )}
              </div>
            </>
          ) : (
            <div className="date-picker-years">
              {years.map((year) => (
                <button
                  key={year}
                  type="button"
                  className="date-picker-year"
                  data-selected={cursor.getFullYear() === year}
                  onClick={() => {
                    setCursor(new Date(year, cursor.getMonth(), 1))
                    setView("days")
                  }}
                >
                  {year}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
