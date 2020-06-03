const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const write = promisify(fs.writeFile)
const read = promisify(fs.readFile)
const unlink = promisify(fs.unlink)

function resolvePathToTempDir(fileName, tempDir = '../temp/') {
  return path.join(__dirname, tempDir, fileName)
}

function debugLog(msg) {
  if (process.env.ESTIMO_DEBUG) {
    console.info(msg)
  }
}

function getUrlToHtmlFile(file) {
  return `file://${path.resolve(file)}`
}

function megabitsToBytes(megabits) {
  return (megabits * 1024 * 1024) / 8
}

function getLibraryName(lib) {
  if (/^https?/.test(lib)) {
    return lib.substring(lib.lastIndexOf('/') + 1)
  }
  return path.basename(lib)
}

function isJsFile(p) {
  const JS_FILES = /\.m?js$/i
  return JS_FILES.test(path.extname(path.basename(p)))
}

function isUrl(p) {
  const WEB_URLS = /^(https?|file):/
  return WEB_URLS.test(p)
}

function splitResourcesForEstimo(resources) {
  const items = Array.isArray(resources) ? resources : [resources]
  const libraries = []
  const pages = []

  items.forEach((item) => {
    if (isJsFile(item)) {
      libraries.push(item)
    } else if (isUrl(item) && !isJsFile(item)) {
      pages.push(item)
    } else {
      throw new TypeError(
        'Estimo works only with resources which are (paths to js files) OR (urls to web pages) (<String> OR <Array<String>>)'
      )
    }
  })

  return { libraries, pages }
}

function checkEstimoArgs(resources, browserOptions) {
  if (typeof resources !== 'string' && !Array.isArray(resources)) {
    throw new TypeError(
      'The first argument should be String or Array<String> which contains a path to the resource (js file or web page).'
    )
  }
  if (Array.isArray(resources)) {
    if (resources.length === 0) {
      throw new TypeError(
        'All resources should be represented as a <String> path to the resource (js file or web page).'
      )
    }
    resources.forEach((item) => {
      if (typeof item !== 'string') {
        throw new TypeError(
          'All resources should be represented as a <String> path to the resource (js file or web page).'
        )
      }
    })
  }
  if (
    typeof browserOptions !== 'object' ||
    browserOptions === null ||
    (typeof browserOptions === 'object' && browserOptions.constructor !== Object)
  ) {
    throw new TypeError(
      'The second argument should be an Object which contains browser options (see https://github.com/mbalabash/estimo#additional-use-cases).'
    )
  }
}

async function readFile(filePath) {
  let content

  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`${filePath} - file not exist!`)
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
    debugLog(`\n[estimo]: The file has been written: ${filePath}\n`)
  } catch (error) {
    console.error(error)
  }
}

async function deleteFile(filePath) {
  try {
    await unlink(filePath)
    debugLog(`\n[estimo]: The file has been removed: ${filePath}\n`)
  } catch (error) {
    console.error(error)
  }
}

async function removeAllFiles(files) {
  try {
    for (const file of files) {
      if (typeof file === 'string') {
        await deleteFile(file)
      }
    }
  } catch (error) {
    console.error(error)
  }
}

module.exports = {
  splitResourcesForEstimo,
  resolvePathToTempDir,
  getUrlToHtmlFile,
  megabitsToBytes,
  checkEstimoArgs,
  getLibraryName,
  removeAllFiles,
  deleteFile,
  writeFile,
  isJsFile,
  readFile,
  debugLog,
  isUrl,
}
