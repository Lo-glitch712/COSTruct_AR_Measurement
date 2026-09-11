import type { ReactElement, SVGProps } from "react"

/**
 * Line icons drawn on a 24×24 grid. They inherit `currentColor` and the
 * surrounding font size, so a parent can tint or resize them like text.
 */
export type IconName =
  | "ruler"
  | "calculator"
  | "truck"
  | "compass"
  | "camera"
  | "folder"
  | "store"
  | "menu"
  | "arrowLeft"
  | "arrowRight"
  | "check"
  | "trash"

const PATHS: Record<IconName, ReactElement> = {
  ruler: (
    <>
      <path d="M3.6 14.4 14.4 3.6a1.4 1.4 0 0 1 2 0l4 4a1.4 1.4 0 0 1 0 2L9.6 20.4a1.4 1.4 0 0 1-2 0l-4-4a1.4 1.4 0 0 1 0-2Z" />
      <path d="m7.5 10.5 2 2M10.5 7.5l2 2M13.5 4.5l2 2M4.5 13.5l2 2" />
    </>
  ),
  calculator: (
    <>
      <rect x="4" y="2.5" width="16" height="19" rx="2.5" />
      <path d="M7.5 6.5h9v3.5h-9z" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 17.5h.01M12 17.5h.01M16 17.5h.01" />
    </>
  ),
  truck: (
    <>
      <path d="M2.5 6.5h11v9h-11z" />
      <path d="M13.5 10h4l3 3v2.5h-7z" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
      <path d="M9 18h6M2.5 15.5H5" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9.25" />
      <path d="m15.5 8.5-2 5-5 2 2-5z" />
    </>
  ),
  camera: (
    <>
      <path d="M3 8.5h3l1.5-2.5h9L18 8.5h3v11H3z" />
      <circle cx="12" cy="13.5" r="3.5" />
    </>
  ),
  folder: (
    <>
      <path d="M3 6.5a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </>
  ),
  store: (
    <>
      <path d="M3.5 9.5 5 4h14l1.5 5.5" />
      <path d="M3.5 9.5a2.75 2.75 0 0 0 5.5 0 2.75 2.75 0 0 0 5.5 0 2.75 2.75 0 0 0 5.5 0" />
      <path d="M5 12v8h14v-8" />
      <path d="M10 20v-4.5h4V20" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  arrowLeft: <path d="M19 12H5m0 0 6-6m-6 6 6 6" />,
  arrowRight: <path d="M5 12h14m0 0-6-6m6 6-6 6" />,
  check: <path d="m4.5 12.5 5 5 10-11" />,
  trash: (
    <>
      <path d="M4 6.5h16M9.5 6.5V4.5h5v2M6.5 6.5l1 13h9l1-13" />
      <path d="M10.5 10v6M13.5 10v6" />
    </>
  ),
}

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName
  size?: number | string
}

export default function Icon({ name, size = "1em", ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      {...props}
    >
      {PATHS[name]}
    </svg>
  )
}
