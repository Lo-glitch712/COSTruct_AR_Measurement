import path from "node:path"
import { createRequire } from "node:module"
import { fileURLToPath } from "node:url"

const require = createRequire(import.meta.url)
const patch = path
  .join(path.dirname(fileURLToPath(import.meta.url)), "patch-readlink.cjs")
  .replace(/\\/g, "/")

// Next spawns worker processes for builds, so the shim has to be inherited too.
process.env.NODE_OPTIONS = [process.env.NODE_OPTIONS, `--require "${patch}"`]
  .filter(Boolean)
  .join(" ")

require(patch)
require("next/dist/bin/next")
