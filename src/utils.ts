import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'
import debugFactory from 'debug'

const write = promisify(fs.writeFile)
const read = promisify(fs.readFile)
const unlink = promisify(fs.unlink)

export const debugLog = debugFactory('perfkit:estimo')

export function resolvePathToTempDir(fileName: string, tempDir = '../temp/') {
  return path.join(__dirname, tempDir, fileName)
}

export function readFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${filePath} - file not exist!`)
  }
  return read(filePath, 'utf8')
}

export async function writeFile(filePath: string, content: string) {
  await write(filePath, content)
  debugLog(`\n[estimo]: The file has been written: ${filePath}\n`)
}

export async function deleteFile(filePath: string) {
  await unlink(filePath)
  debugLog(`\n[estimo]: The file has been removed: ${filePath}\n`)
}

export function getUrlToHtmlFile(file: string) {
  return `file://${path.resolve(file)}`
}

export function megabitsToBytes(megabits: number) {
  return (megabits * 1024 * 1024) / 8
}

export async function removeAllFiles(files: string[]) {
  for (const file of files) {
    if (file) {
      await deleteFile(file)
    }
  }
}

export function getLibraryName(lib: string) {
  if (/^http/.test(lib)) {
    return lib.substring(lib.lastIndexOf('/') + 1)
  }
  return path.basename(lib)
}

export function isJsFile(p: string) {
  const JS_FILES = /\.m?js$/i
  return JS_FILES.test(path.extname(path.basename(p)))
}

export function isUrl(p: string) {
  const WEB_URLS = /^(https?|file):/
  return WEB_URLS.test(p)
}

export function splitResourcesForEstimo(resources: string[]) {
  const items = Array.isArray(resources) ? resources : [resources]
  const pages: string[] = []
  const libraries: string[] = []

  items.forEach(item => {
    if (isJsFile(item)) {
      libraries.push(item)
    } else if (isUrl(item) && !isJsFile(item)) {
      pages.push(item)
    } else {
      throw new Error(
        `Estimo works only with resources which is path to js files OR url to pages (<String> OR <Array<String>>)`
      )
    }
  })

  return { libraries, pages }
}
