const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const write = promisify(fs.writeFile)
const read = promisify(fs.readFile)
const unlink = promisify(fs.unlink)

function resolvePathToTempDir(fileName, tempDir = '../temp/') {
  return path.join(__dirname, tempDir, fileName)
}

async function readFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`${filePath} - file not exist!`)
    }
    return await read(filePath, 'utf8')
  } catch (error) {
    console.error(error.stack)
    return process.exit(1)
  }
}

async function writeFile(filePath, content) {
  try {
    await write(filePath, content)
  } catch (error) {
    console.error(error.stack)
    process.exit(1)
  }
}

async function deleteFile(filePath) {
  try {
    await unlink(filePath)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

function getUrlToHtmlFile(file) {
  return `file://${path.resolve(file)}`
}

function megabitsToBytes(megabits) {
  return (megabits * 1024 * 1024) / 8
}

async function removeTempFiles(files) {
  for (const file of files) {
    await deleteFile(file)
  }
}

function getLibraryName(lib) {
  if (/^http/.test(lib)) {
    return lib.substring(lib.lastIndexOf('/') + 1)
  }
  return path.basename(lib)
}

function isJsFile(p) {
  const JS_FILES = /\.m?js$/i
  return JS_FILES.test(path.extname(path.basename(p)))
}

function isUrl(p) {
  const WEB_PAGES = /^(https?|file):/
  return WEB_PAGES.test(p)
}

module.exports = {
  resolvePathToTempDir,
  getUrlToHtmlFile,
  megabitsToBytes,
  removeTempFiles,
  getLibraryName,
  deleteFile,
  writeFile,
  isUrl,
  isJsFile,
  readFile,
}
