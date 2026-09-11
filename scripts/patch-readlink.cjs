/**
 * exFAT volumes make readlink() fail with EISDIR on ordinary files, while every
 * module resolver in the Node ecosystem only treats EINVAL/UNKNOWN as "not a
 * symlink". Without this the Next build dies on `node_modules` lookups.
 */
const fs = require("fs")

const UV_EINVAL = -4071

function normalize(err) {
  if (err && err.code === "EISDIR" && err.syscall === "readlink") {
    err.code = "EINVAL"
    err.errno = UV_EINVAL
    err.message = err.message.replace("EISDIR:", "EINVAL:")
  }
  return err
}

const { readlinkSync, readlink } = fs

fs.readlinkSync = function patchedReadlinkSync(...args) {
  try {
    return readlinkSync.apply(fs, args)
  } catch (err) {
    throw normalize(err)
  }
}

fs.readlink = function patchedReadlink(...args) {
  const callback = args[args.length - 1]
  if (typeof callback !== "function") return readlink.apply(fs, args)
  args[args.length - 1] = (err, ...rest) => callback(normalize(err), ...rest)
  return readlink.apply(fs, args)
}

if (fs.promises && typeof fs.promises.readlink === "function") {
  const promisedReadlink = fs.promises.readlink
  fs.promises.readlink = function patchedReadlinkPromise(...args) {
    return promisedReadlink.apply(fs.promises, args).catch((err) => {
      throw normalize(err)
    })
  }
}
