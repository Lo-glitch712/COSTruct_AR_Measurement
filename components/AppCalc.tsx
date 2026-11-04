"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import Icon from "@/components/Icon"

const KEYS = [
  "sin",
  "cos",
  "tan",
  "log",
  "ln",
  "√",
  "x²",
  "xʸ",
  "π",
  "e",
  "%",
  "n!",
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
  "±",
  "1",
  "2",
  "3",
  "=",
  "0",
  ".",
] as const

const FN_KEYS = new Set([
  "sin",
  "cos",
  "tan",
  "log",
  "ln",
  "√",
  "x²",
  "xʸ",
  "π",
  "e",
  "%",
  "n!",
  "±",
])

const OP_KEYS = new Set(["÷", "×", "−", "+", "xʸ", "="])

function factorial(value: number) {
  if (value < 0 || !Number.isInteger(value) || value > 170) return NaN
  let result = 1
  for (let n = 2; n <= value; n += 1) result *= n
  return result
}

function compute(left: number, right: number, op: string) {
  if (op === "+") return left + right
  if (op === "−") return left - right
  if (op === "×") return left * right
  if (op === "÷") return right === 0 ? NaN : left / right
  if (op === "xʸ") return left ** right
  return right
}

function format(value: number) {
  if (!Number.isFinite(value)) return "Error"
  const text = value.toLocaleString("en-PH", {
    maximumFractionDigits: 10,
    useGrouping: false,
  })
  return text.length > 12 ? value.toExponential(6) : text
}

function toRadians(value: number, deg: boolean) {
  return deg ? (value * Math.PI) / 180 : value
}

export default function AppCalc() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [display, setDisplay] = useState("0")
  const [stored, setStored] = useState<number | null>(null)
  const [op, setOp] = useState<string | null>(null)
  const [fresh, setFresh] = useState(true)
  const [deg, setDeg] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  function reset() {
    setDisplay("0")
    setStored(null)
    setOp(null)
    setFresh(true)
  }

  function show(value: number) {
    setDisplay(format(value))
    setFresh(true)
  }

  function current() {
    return Number(display)
  }

  function applyUnary(key: string) {
    const value = current()
    const angle = toRadians(value, deg)
    if (key === "sin") show(Math.sin(angle))
    else if (key === "cos") show(Math.cos(angle))
    else if (key === "tan") show(Math.tan(angle))
    else if (key === "log") show(Math.log10(value))
    else if (key === "ln") show(Math.log(value))
    else if (key === "√") show(Math.sqrt(value))
    else if (key === "x²") show(value * value)
    else if (key === "%") show(value / 100)
    else if (key === "±") show(-value)
    else if (key === "n!") show(factorial(value))
  }

  function press(key: string) {
    if (key === "C") {
      reset()
      return
    }
    if (key === "π") {
      show(Math.PI)
      return
    }
    if (key === "e") {
      show(Math.E)
      return
    }
    if (
      key === "sin" ||
      key === "cos" ||
      key === "tan" ||
      key === "log" ||
      key === "ln" ||
      key === "√" ||
      key === "x²" ||
      key === "%" ||
      key === "±" ||
      key === "n!"
    ) {
      applyUnary(key)
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
    const value = current()
    if (key === "=") {
      if (stored === null || !op) return
      show(compute(stored, value, op))
      setStored(null)
      setOp(null)
      return
    }
    if (stored !== null && op && !fresh) {
      const result = compute(stored, value, op)
      setStored(result)
      setDisplay(format(result))
    } else {
      setStored(value)
    }
    setOp(key)
    setFresh(true)
  }

  return (
    <>
      <button
        type="button"
        className="nav-calc"
        aria-label="Open scientific calculator"
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
                aria-label="Scientific calculator"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="calc-head">
                  <strong>Scientific</strong>
                  <button
                    type="button"
                    className="calc-mode"
                    aria-pressed={deg}
                    onClick={() => setDeg((value) => !value)}
                  >
                    {deg ? "DEG" : "RAD"}
                  </button>
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
                        FN_KEYS.has(key) ? " is-fn" : ""
                      }${OP_KEYS.has(key) ? " is-op" : ""}${
                        key === "C" ? " is-clear" : ""
                      }`}
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
