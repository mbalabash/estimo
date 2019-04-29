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
    const content = await read(filePath, 'utf8')
    return content
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

module.exports = {
  resolvePathToTempDir,
  getUrlToHtmlFile,
  megabitsToBytes,
  deleteFile,
  writeFile,
  readFile,
}
