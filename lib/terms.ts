export const TERMS_VERSION = "2026-11-04"
export const TERMS_UPDATED = "4 November 2026"

const STORAGE_KEY = "costruct.terms"

type Acceptance = {
  version: string
  acceptedAt: string
}

function readStore(): Record<string, Acceptance> {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, Acceptance>
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

export function hasAcceptedTerms(email: string) {
  const key = email.trim().toLowerCase()
  if (!key) return false
  return readStore()[key]?.version === TERMS_VERSION
}

export function acceptTerms(email: string) {
  const key = email.trim().toLowerCase()
  if (!key) return
  const next = {
    ...readStore(),
    [key]: { version: TERMS_VERSION, acceptedAt: new Date().toISOString() },
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

export const TERMS_SECTIONS: { title: string; body: string }[] = [
  {
    title: "1. Agreement to these Terms",
    body: "These Terms and Conditions (“Terms”) govern your access to and use of COSTruct, a web-based measurement, material quantity cost estimation, and procurement system with decision support for construction projects. By signing in, tapping I agree, or continuing to use the app after this notice, you confirm that you have read these Terms, that you understand them, and that you accept them. If you do not agree, sign out and do not use COSTruct. These Terms apply to buyers, suppliers, and administrators.",
  },
  {
    title: "2. Who may use COSTruct",
    body: "You must use the role assigned to your account. Buyers create projects, enter or capture dimensions, generate estimates, and browse hardware stores. Suppliers maintain a catalog and unit prices for a registered store. Administrators monitor accounts, projects, and catalogs. Supplier and administrator logins are issued by COSTruct and may not be created as self-serve signups. You may not share a login, impersonate another person or store, or use an account that does not belong to you.",
  },
  {
    title: "3. Nature of the service",
    body: "COSTruct is a planning and decision-support tool. It helps you record measurements, convert them into material quantities, price a bill of materials, and compare hardware options. It is not a licensed surveying practice, structural engineering office, architecture firm, or contractor. Nothing in the app is a professional stamp, a building permit, a bid, or a contract to supply materials. You remain responsible for verifying every figure on site and for complying with local building codes, occupancy rules, and procurement policies.",
  },
  {
    title: "4. Measurements, including AR",
    body: "You may enter length, width, and height by hand or capture them with the camera-based AR tools. Manual entry is the primary method and needs only a tape measure. AR results depend on your device, lighting, how steadily you move, surface texture, and whether the space was fully scanned. COSTruct does not warrant that an AR capture matches a licensed survey. Always check AR values against a physical measurement before you order materials, pour concrete, or start work. If AR does not lock a dimension, enter it yourself.",
  },
  {
    title: "5. Quantities and cost estimates",
    body: "Quantities are produced from standard take-off factors used inside COSTruct (for example sand, cement, gravel, CHB, and related lines per component). Those factors are planning defaults. Site waste, mix design, bar sizes, formwork, and workmanship will change what you actually buy. Peso totals are estimates only. They can differ from a supplier’s quotation, a contractor’s bid, or the amount on a receipt. You should treat the estimate as a guide for comparison, not as a guaranteed price.",
  },
  {
    title: "6. Hardware catalogs and procurement",
    body: "Catalog prices are either canvassed reference figures from hardware stores in the Partido area or prices a supplier has entered in the app. Availability, lead time, brands, and the amount you pay can change without notice. COSTruct does not sell cement, aggregates, CHB, or any other material. COSTruct is not a party to any purchase, delivery, or warranty between you and a hardware store. Confirm stock, pickup, and payment terms directly with the store before you rely on a line item.",
  },
  {
    title: "7. Decision support",
    body: "When the app ranks or highlights a store, it does so from the data available at that moment: quoted or reference prices, whether a material appears in a catalog, and stated lead time. Rankings are not an endorsement, a finding that a store is the cheapest in the market, or advice to award a contract. You decide which store to contact. COSTruct is not liable if a highlighted option is later out of stock, delayed, or priced differently.",
  },
  {
    title: "8. Your account and security",
    body: "Keep your email and password confidential. You are responsible for activity that occurs while your account is signed in on a device. Use a password that is not shared with other sites. Tell an administrator if you believe someone else has used your login. COSTruct may suspend an account that is shared, abused, or used to impersonate a buyer, store, or staff member. You must keep your profile details (name, contact number, and address) accurate enough for project records.",
  },
  {
    title: "9. Project data you enter",
    body: "Project names, site addresses, descriptions, component lists, dimensions, AR results, drafts, and saved estimates may be stored on your device and, when the app is connected, in the COSTruct database. Enter only information you are allowed to store. Do not upload secrets, classified plans, or personal data of other people unless they have agreed. You are responsible for backing up any figures you cannot afford to lose. Deleting a project on your device may not remove every server copy if the record was already saved remotely.",
  },
  {
    title: "10. Acceptable use",
    body: "Use COSTruct only for legitimate construction estimating and procurement. You must not attempt to bypass access controls, scrape other users’ catalogs or personal data, interfere with AR or estimate calculations, upload malware, or use the service to harass a buyer, supplier, or administrator. You must not reverse engineer the take-off factors in order to misrepresent quantities to a client or a store. Automated access that overloads the service is not allowed.",
  },
  {
    title: "11. Intellectual property",
    body: "COSTruct, its name, layout, copy, take-off logic, and interface are provided for your use inside the app. You may export or save your own project estimates for your job. You may not copy the app, resell it, or present COSTruct’s screens as your own product. Hardware store names and catalogs remain the information of those stores. Sample dimensions shown in previews are illustrations only.",
  },
  {
    title: "12. Accuracy, interruptions, and changes",
    body: "The app may be updated, paused, or unavailable because of device limits, network issues, or maintenance. Features such as AR, supplier catalogs, and remote signup depend on device permissions and on the database being reachable. COSTruct may change factors, layouts, or flows as the product improves. Continued use after a change to these Terms means you accept the revised version. We may ask you to agree again when the version date at the top of this notice changes.",
  },
  {
    title: "13. No professional or financial advice",
    body: "Nothing in COSTruct is legal, engineering, surveying, architectural, or financial advice. A peso total is not a loan offer, a budget guarantee, or tax advice. If your project requires a licensed professional, a geodetic survey, or a signed bill of quantities, obtain that separately. Do not use COSTruct as the sole basis for structural safety decisions.",
  },
  {
    title: "14. Limitation of liability",
    body: "To the fullest extent allowed by applicable law, COSTruct and the people who operate it are not liable for lost materials, extra trips to a hardware store, construction delays, cost overruns, or property damage that arise from relying on an estimate, an AR capture, a catalog price, or a ranked supplier. You use the measurements and prices at your own risk. If a court finds that liability cannot be fully excluded, it is limited to the amount you paid to use COSTruct in the three months before the claim, which may be zero if the service is provided without a fee.",
  },
  {
    title: "15. Privacy of account information",
    body: "We use the name, email, phone, address, role, and project data you provide in order to run your workspace, restore a session, and (for suppliers and administrators) operate catalogs and monitoring. Do not submit payment card numbers into project notes. Device storage such as local drafts can remain on a shared phone until you sign out and clear the browser data. You can review profile fields in Settings.",
  },
  {
    title: "16. Termination",
    body: "You may stop using COSTruct at any time by signing out. An administrator may close an account that violates these Terms, that was created with false details, or that is no longer needed. After closure, local drafts on a device may still exist until you delete them. Surviving sections include intellectual property, limitation of liability, and the nature of estimates as planning aids.",
  },
  {
    title: "17. Contact",
    body: "Questions about these Terms can be raised through the account you use in COSTruct, or with the administrator who issued a supplier or admin login. Site-specific disputes with a hardware store should be taken up with that store, not through this notice.",
  },
  {
    title: "18. Acknowledgement",
    body: "By tapping I agree, you confirm that you have scrolled through these Terms, that you understand COSTruct is a planning tool rather than a certified survey or a materials contract, and that you will verify dimensions and prices before you buy or build. You agree to use the role on your account and to keep your login to yourself.",
  },
]
