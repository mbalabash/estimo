import { findChrome } from 'find-chrome-bin'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import puppeteer from 'puppeteer-core'
import { PUPPETEER_REVISIONS } from 'puppeteer-core/lib/cjs/puppeteer/revisions.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const chromeTempPath = path.join(__dirname, '..', 'temp', 'chrome')
const chromeConfigPath = path.join(__dirname, '..', 'chrome.json')

const write = promisify(fs.writeFile)
const read = promisify(fs.readFile)
const unlink = promisify(fs.unlink)

export function resolvePathToTempDir(fileName, tempDir = '../temp/') {
  return path.join(__dirname, tempDir, fileName)
}

export function getUrlToHtmlFile(file) {
  return `file://${path.resolve(file)}`
}

export function getLibraryName(lib) {
  if (/^https?/.test(lib)) {
    return lib.substring(lib.lastIndexOf('/') + 1)
  }
  return path.basename(lib)
}

export function isJsFile(p) {
  let JS_FILES = /\.m?js$/i
  return JS_FILES.test(path.extname(path.basename(p)))
}

export function isUrl(p) {
  let WEB_URLS = /^(https?|file):/
  return WEB_URLS.test(p)
}

export function splitResourcesForEstimo(resources) {
  let items = Array.isArray(resources) ? resources : [resources]
  let libraries = []
  let pages = []

  items.forEach(item => {
    if (isJsFile(item)) {
      libraries.push(item)
    } else if (isUrl(item) && !isJsFile(item)) {
      pages.push(item)
    } else {
      throw new TypeError(
        'Estimo works only with resources which are (paths to Js files) OR (urls to Web pages) (<String> OR <Array<String>>)'
      )
    }
  })

  return { libraries, pages }
}

export function checkEstimoArgs(resources, browserOptions) {
  if (typeof resources !== 'string' && !Array.isArray(resources)) {
    throw new TypeError(
      'The first argument should be String or Array<String> which contains a path to the resource (Js file or Web page).'
    )
  }
  if (Array.isArray(resources)) {
    if (resources.length === 0) {
      throw new TypeError(
        'All resources should be represented as a <String> path to the resource (Js file or Web page).'
      )
    }
    resources.forEach(item => {
      if (typeof item !== 'string') {
        throw new TypeError(
          'All resources should be represented as a <String> path to the resource (Js file or Web page).'
        )
      }
    })
  }
  if (
    typeof browserOptions !== 'object' ||
    browserOptions === null ||
    (typeof browserOptions === 'object' &&
      browserOptions.constructor !== Object)
  ) {
    throw new TypeError(
      'The second argument should be an Object which contains browser options (see https://github.com/mbalabash/estimo#additional-use-cases).'
    )
  }
}

export function createDiff(current, base) {
  if (current === 0 && base === 0) {
    return 'N/A'
  }
  if (current === 0 && base !== 0) {
    return '-100%'
  }

  let value = ((current - base) / current) * 100
  let formatted = (Math.sign(value) * Math.ceil(Math.abs(value) * 100)) / 100

  if (value > 0) {
    return `+${formatted}% 🔺`
  }
  if (value === 0) {
    return `${formatted}%`
  }
  return `${formatted}% 🔽`
}

const defaultMedianAccessor = element => element
const defaultMedianExecutor = (a, b) => (a + b) / 2
export function median(
  array,
  accessor = defaultMedianAccessor,
  executor = defaultMedianExecutor
) {
  let sortedArray = array.sort((a, b) => accessor(a) - accessor(b))
  let { length } = sortedArray
  let mid = parseInt(length / 2, 10)

  if (length % 2) {
    return sortedArray[mid]
  }
  let low = mid - 1
  let hight = mid

  return executor(sortedArray[low], sortedArray[hight])
}

export function estimoMedianExecutor(reportA, reportB) {
  if (reportA.name !== reportB.name) {
    throw new Error(
      'Both the first report name and the second report name should be the same!'
    )
  }

  let calc = (a, b) => +((a + b) / 2).toFixed(2)

  return {
    garbageCollection: calc(
      reportA.garbageCollection,
      reportB.garbageCollection
    ),
    javaScript: calc(reportA.javaScript, reportB.javaScript),
    name: reportA.name,
    other: calc(reportA.other, reportB.other),
    paintCompositeRender: calc(
      reportA.paintCompositeRender,
      reportB.paintCompositeRender
    ),
    parseHTML: calc(reportA.parseHTML, reportB.parseHTML),
    scriptEvaluation: calc(reportA.scriptEvaluation, reportB.scriptEvaluation),
    scriptParseCompile: calc(
      reportA.scriptParseCompile,
      reportB.scriptParseCompile
    ),
    styleLayout: calc(reportA.styleLayout, reportB.styleLayout),
    total: calc(reportA.total, reportB.total)
  }
}

export async function readFile(filePath) {
  let content

  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`${filePath} - file isn't exist!`)
    }
    content = await read(filePath, 'utf8')
  } catch (error) {
    console.error(error)
  }

  return content
}

export async function writeFile(filePath, content) {
  try {
    await write(filePath, content)
  } catch (error) {
    console.error(error)
  }
}

export async function deleteFile(filePath) {
  try {
    await unlink(filePath)
  } catch (error) {
    console.error(error)
  }
}

export async function removeAllFiles(files) {
  if (process.env.ESTIMO_DEBUG) {
    return
  }

  try {
    for (let file of files) {
      if (typeof file === 'string') {
        await deleteFile(file)
      }
    }
  } catch (error) {
    console.error(error)
  }
}

export function existsAsync(filePath) {
  return fs.promises.stat(filePath).catch(() => false)
}

export async function findChromeBinary() {
  try {
    let configData = JSON.parse(await readFile(chromeConfigPath))
    if (configData.executablePath.length > 0) {
      return configData
    }

    let chromeInfo = await findChrome({
      download: {
        path: chromeTempPath,
        puppeteer,
        revision: PUPPETEER_REVISIONS.chrome
      }
    })
    await writeFile(chromeConfigPath, JSON.stringify(chromeInfo))

    return chromeInfo
  } catch (error) {
    console.info()
    console.error(error)
    console.info()
    return { browser: '', executablePath: '' }
  }
}
