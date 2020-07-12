const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const write = promisify(fs.writeFile)
const read = promisify(fs.readFile)
const unlink = promisify(fs.unlink)

function resolvePathToTempDir(fileName, tempDir = '../temp/') {
  return path.join(__dirname, tempDir, fileName)
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
    resources.forEach((item) => {
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
    (typeof browserOptions === 'object' && browserOptions.constructor !== Object)
  ) {
    throw new TypeError(
      'The second argument should be an Object which contains browser options (see https://github.com/mbalabash/estimo#additional-use-cases).'
    )
  }
}

const defaultMedianAccessor = (element) => element
function median(array, accessor = defaultMedianAccessor) {
  const sortedArray = array.sort((a, b) => accessor(a) - accessor(b))
  const { length } = sortedArray
  const mid = parseInt(length / 2, 10)

  if (length % 2) {
    return sortedArray[mid]
  }
  const low = mid - 1
  const hight = mid

  return (accessor(sortedArray[low]) + accessor(sortedArray[hight])) / 2
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
    for (const file of files) {
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

module.exports = {
  splitResourcesForEstimo,
  resolvePathToTempDir,
  getUrlToHtmlFile,
  megabitsToBytes,
  checkEstimoArgs,
  getLibraryName,
  removeAllFiles,
  existsAsync,
  deleteFile,
  writeFile,
  isJsFile,
  readFile,
  median,
  isUrl,
}
