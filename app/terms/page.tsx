import Link from "next/link"
import Icon from "@/components/Icon"

const SECTIONS: { title: string; body: string }[] = [
  {
    title: "1. Agreement",
    body: "These Terms and Conditions govern your use of COSTruct, a web-based measurement, material quantity cost estimation, and procurement system with decision support for construction projects. By creating an account, signing in, or tapping Get started, you agree to these terms.",
  },
  {
    title: "2. Who can use COSTruct",
    body: "Buyers measure projects and generate estimates. Suppliers maintain hardware catalogs and prices. Admins monitor accounts, projects, and catalogs. Supplier and admin accounts are issued by COSTruct. Buyers may create their own accounts.",
  },
  {
    title: "3. Measurements and estimates",
    body: "Manual dimensions, AR captures, quantities, and peso totals are planning aids. They are not a licensed survey, structural design, or a contractor’s bid. Always verify figures on site before you buy materials or begin work. AR results depend on your device camera, lighting, and how steadily you measure.",
  },
  {
    title: "4. Prices and suppliers",
    body: "Catalog prices are reference figures canvassed from hardware stores or set by a supplier in the app. Availability, lead time, and the amount you actually pay can change. COSTruct does not sell materials and is not a party to any purchase you make with a hardware store.",
  },
  {
    title: "5. Your account",
    body: "Keep your email and password confidential. You are responsible for activity on your account. Do not share a buyer, supplier, or admin login. Tell COSTruct if you believe someone else is using your account.",
  },
  {
    title: "6. Acceptable use",
    body: "Use the app only for legitimate construction estimating and procurement. Do not attempt to break access controls, scrape other users’ data, upload harmful files, or impersonate another person or store.",
  },
  {
    title: "7. Data",
    body: "Project names, site addresses, dimensions, and estimates may be stored on your device and, when connected, in the COSTruct database. We use that information to run the workspace you signed in to. Do not enter secrets you are not willing to store there.",
  },
  {
    title: "8. Changes",
    body: "These terms may be updated as the product changes. Continued use after an update means you accept the revised terms. If you do not agree, stop using COSTruct and delete your account from Settings where that option is available.",
  },
  {
    title: "9. Contact",
    body: "Questions about these terms can be sent through the account you use in COSTruct, or to the administrator who issued a supplier or admin login.",
  },
]

export default function TermsPage() {
  return (
    <main className="legal">
      <article className="legal-card">
        <p className="eyebrow">COSTruct</p>
        <h1 className="intro-title">Terms and Conditions</h1>
        <p className="intro-copy">
          Last updated 4 November 2026. Please read this before you create an
          account or start a measurement.
        </p>

        {SECTIONS.map((section) => (
          <section key={section.title} className="legal-section">
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </section>
        ))}

        <div className="intro-actions" style={{ justifyContent: "flex-start" }}>
          <Link href="/" className="btn btn-secondary">
            <Icon name="arrowLeft" size={16} />
            Back to welcome
          </Link>
        </div>
      </article>
    </main>
  )
}
