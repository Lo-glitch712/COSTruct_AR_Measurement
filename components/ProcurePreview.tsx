import Icon from "@/components/Icon"

const STORES = [
  { name: "Johan Hardware", town: "Tigaon", best: false },
  { name: "HDC Hardware", town: "Tigaon", best: false },
  { name: "Nikki & Kikko Hardware", town: "Goa", best: true },
]

export default function ProcurePreview() {
  return (
    <div
      className="proc-preview"
      role="img"
      aria-label="Animated procurement. Three hardware stores are compared, then Nikki and Kikko Hardware is marked the best match."
    >
      <div className="proc-criteria" aria-hidden="true">
        <span>Price</span>
        <span>Availability</span>
        <span>Lead time</span>
      </div>
      <ul className="proc-stores">
        {STORES.map((store, index) => (
          <li
            key={store.name}
            className={`proc-store proc-store-${index + 1}${store.best ? " is-best" : ""}`}
          >
            <span className="proc-icon" aria-hidden="true">
              <Icon name="store" size={18} />
            </span>
            <div>
              <strong>{store.name}</strong>
              <span>{store.town}</span>
            </div>
            {store.best ? (
              <>
                <span className="proc-truck" aria-hidden="true">
                  <Icon name="truck" size={18} />
                </span>
                <span className="proc-badge">Best match</span>
              </>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
