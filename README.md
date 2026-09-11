# COSTruct

A web-based measurement, material quantity cost estimation and procurement
system with decision support for construction projects.

Live at <https://costructar.vercel.app>. Vercel deploys every push to `main`.

## Running

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm start
```

## Flow

`/` Get started → `/login` (Buyer or Supplier) → `/home` (welcome), with a top
navigation bar for Supplier, Measurements, Projects, About, and Settings.

Sign-in is client-side only for now — the selected role and email are kept in
`localStorage` under `costruct.session`. Swap `lib/session.ts` for a real API
when the backend exists.

## Measurement and estimation

`/measurements` is the primary workflow: type length, width, and height for any
of the seven structural components and the bill of materials and cost update as
you go. The take-off factors and unit prices live in `lib/estimate.ts`.

Those factors are the same ones the AR build uses, so a component measured by
hand and the same component measured with AR produce an identical estimate.

## AR measurement (optional)

The original 8th Wall / A-Frame build lives untouched in `public/ar/` and is
served as a static page at `/ar/index.html`, offered as a secondary option at
the bottom of the Measurements page. Its `distance-measure` component and
estimation screens are byte-for-byte the same as before the Next.js port. The
camera only works over `localhost` or HTTPS.

The system is fully usable without it — AR is kept as an innovation track for
future development rather than a dependency.

## Icons

`components/Icon.tsx` holds every icon as an inline 24×24 SVG that inherits
`currentColor`. The UI uses no emoji.
