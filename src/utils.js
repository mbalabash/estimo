const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const puppeteer = require('puppeteer-core')
const { findChrome } = require('find-chrome-bin')
const {
  PUPPETEER_REVISIONS
} = require('puppeteer-core/lib/cjs/puppeteer/revisions')

const chromeTempPath = path.join(__dirname, '..', 'temp', 'chrome')
const chromeConfigPath = path.join(__dirname, '..', 'chrome.json')

const write = promisify(fs.writeFile)
const read = promisify(fs.readFile)
const unlink = promisify(fs.unlink)

function resolvePathToTempDir(fileName, tempDir = '../temp/') {
  return path.join(__dirname, tempDir, fileName)
}

function getUrlToHtmlFile(file) {
  return `file://${path.resolve(file)}`
}

function getLibraryName(lib) {
  if (/^https?/.test(lib)) {
    return lib.substring(lib.lastIndexOf('/') + 1)
  }
  return path.basename(lib)
}

function isJsFile(p) {
  let JS_FILES = /\.m?js$/i
  return JS_FILES.test(path.extname(path.basename(p)))
}

function isUrl(p) {
  let WEB_URLS = /^(https?|file):/
  return WEB_URLS.test(p)
}

function splitResourcesForEstimo(resources) {
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

function checkEstimoArgs(resources, browserOptions) {
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

function createDiff(current, base) {
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
function median(
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

function estimoMedianExecutor(reportA, reportB) {
  if (reportA.name !== reportB.name) {
    throw new Error(
      'Both the first report name and the second report name should be the same!'
    )
  }

  let calc = (a, b) => +((a + b) / 2).toFixed(2)

  return {
    name: reportA.name,
    parseHTML: calc(reportA.parseHTML, reportB.parseHTML),
    styleLayout: calc(reportA.styleLayout, reportB.styleLayout),
    paintCompositeRender: calc(
      reportA.paintCompositeRender,
      reportB.paintCompositeRender
    ),
    scriptParseCompile: calc(
      reportA.scriptParseCompile,
      reportB.scriptParseCompile
    ),
    scriptEvaluation: calc(reportA.scriptEvaluation, reportB.scriptEvaluation),
    javaScript: calc(reportA.javaScript, reportB.javaScript),
    garbageCollection: calc(
      reportA.garbageCollection,
      reportB.garbageCollection
    ),
    other: calc(reportA.other, reportB.other),
    total: calc(reportA.total, reportB.total)
  }
}

async function readFile(filePath) {
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

async function writeFile(filePath, content) {
  try {
    await write(filePath, content)
  } catch (error) {
    console.error(error)
  }
}

async function deleteFile(filePath) {
  try {
    await unlink(filePath)
  } catch (error) {
    console.error(error)
  }
}

async function removeAllFiles(files) {
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

function existsAsync(filePath) {
  return fs.promises.stat(filePath).catch(() => false)
}

async function findChromeBinary() {
  try {
    let configData = JSON.parse(await readFile(chromeConfigPath))
    if (configData.executablePath.length > 0) {
      return configData
    }

    let chromeInfo = await findChrome({
      min: 9, // TODO: get rid of this hotfix for find-chrome-bin after upgrade to 1.x.x
      download: {
        puppeteer,
        revision: PUPPETEER_REVISIONS.chromium,
        path: chromeTempPath
      }
    })
    await writeFile(chromeConfigPath, JSON.stringify(chromeInfo))

    return chromeInfo
  } catch (error) {
    console.info()
    console.error(error)
    console.info()
    return { executablePath: '', browser: '' }
  }
}

module.exports = {
  splitResourcesForEstimo,
  estimoMedianExecutor,
  resolvePathToTempDir,
  getUrlToHtmlFile,
  findChromeBinary,
  checkEstimoArgs,
  getLibraryName,
  removeAllFiles,
  existsAsync,
  deleteFile,
  createDiff,
  writeFile,
  isJsFile,
  readFile,
  median,
  isUrl
}
