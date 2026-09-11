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

`/` Start Measuring → `/login` (Buyer or Supplier) → `/home` (welcome), with a
top navigation bar for Supplier, Measurements, Projects, About, and Settings.

Sign-in is client-side only for now — the selected role and email are kept in
`localStorage` under `costruct.session`. Swap `lib/session.ts` for a real API
when the backend exists.

## AR measurement

The original 8th Wall / A-Frame build lives untouched in `public/ar/` and is
served as a static page at `/ar/index.html`, linked from the Measurements page.
Its `distance-measure` component and estimation screens are byte-for-byte the
same as before the Next.js port. The camera only works over `localhost` or
HTTPS.
