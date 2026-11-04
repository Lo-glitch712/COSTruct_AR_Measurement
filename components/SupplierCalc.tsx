"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import Icon from "@/components/Icon"

const KEYS = [
  "C",
  "÷",
  "×",
  "−",
  "7",
  "8",
  "9",
  "+",
  "4",
  "5",
  "6",
  "=",
  "1",
  "2",
  "3",
  ".",
  "0",
] as const

function compute(left: number, right: number, op: string) {
  if (op === "+") return left + right
  if (op === "−") return left - right
  if (op === "×") return left * right
  if (op === "÷") return right === 0 ? NaN : left / right
  return right
}

function format(value: number) {
  if (!Number.isFinite(value)) return "Error"
  const text = value.toLocaleString("en-PH", {
    maximumFractionDigits: 8,
    useGrouping: false,
  })
  return text.length > 12 ? value.toExponential(6) : text
}

export default function SupplierCalc() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [display, setDisplay] = useState("0")
  const [stored, setStored] = useState<number | null>(null)
  const [op, setOp] = useState<string | null>(null)
  const [fresh, setFresh] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  function reset() {
    setDisplay("0")
    setStored(null)
    setOp(null)
    setFresh(true)
  }

  function press(key: string) {
    if (key === "C") {
      reset()
      return
    }
    if (key === ".") {
      if (fresh) {
        setDisplay("0.")
        setFresh(false)
        return
      }
      if (!display.includes(".")) setDisplay(`${display}.`)
      return
    }
    if ("0123456789".includes(key)) {
      setDisplay(fresh || display === "0" ? key : `${display}${key}`)
      setFresh(false)
      return
    }
    const current = Number(display)
    if (key === "=") {
      if (stored === null || !op) return
      setDisplay(format(compute(stored, current, op)))
      setStored(null)
      setOp(null)
      setFresh(true)
      return
    }
    if (stored !== null && op && !fresh) {
      const result = compute(stored, current, op)
      setStored(result)
      setDisplay(format(result))
    } else {
      setStored(current)
    }
    setOp(key)
    setFresh(true)
  }

  return (
    <>
      <button
        type="button"
        className="nav-calc"
        aria-label="Open calculator"
        title="Calculator"
        onClick={() => setOpen(true)}
      >
        <Icon name="calculator" size={20} />
      </button>
      {mounted && open
        ? createPortal(
            <div
              className="calc-scrim"
              onClick={() => setOpen(false)}
              role="presentation"
            >
              <div
                className="calc-dialog"
                role="dialog"
                aria-label="Calculator"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="calc-head">
                  <strong>Calculator</strong>
                  <button
                    type="button"
                    className="calc-close"
                    aria-label="Close calculator"
                    onClick={() => setOpen(false)}
                  >
                    Close
                  </button>
                </div>
                <div className="calc-display" aria-live="polite">
                  {display}
                </div>
                <div className="calc-pad">
                  {KEYS.map((key) => (
                    <button
                      key={key}
                      type="button"
                      className={`calc-key${key === "0" ? " is-wide" : ""}${
                        "÷×−+=".includes(key) ? " is-op" : ""
                      }${key === "C" ? " is-clear" : ""}`}
                      onClick={() => press(key)}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
