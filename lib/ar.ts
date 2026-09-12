/**
 * The AR measurement experience is the original 8th Wall build, served
 * verbatim from `public/ar/`. It is intentionally not ported to React so its
 * A-Frame scene and `distance-measure` component stay byte-for-byte unchanged.
 */
export const AR_APP_URL = "/ar/index.html"

/**
 * The AR tool has no way to write values back into the form, so the component
 * name only rides along as a hint for whoever is holding the phone.
 */
export function arUrlFor(component: string) {
  return `${AR_APP_URL}?component=${encodeURIComponent(component)}`
}
