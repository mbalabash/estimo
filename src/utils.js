const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const write = promisify(fs.writeFile)
const read = promisify(fs.readFile)
const unlink = promisify(fs.unlink)

const resolvePathToTempDir = fileName => path.join(__dirname, '../temp/', fileName)

const readFile = async (filePath) => {
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

const writeFile = async (filePath, content) => {
  try {
    await write(filePath, content)
  } catch (error) {
    console.error(error.stack)
    process.exit(1)
  }
}

const deleteFile = async (filePath) => {
  try {
    await unlink(filePath)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

const getUrlToHtmlFile = file => `file://${path.resolve(file)}`

module.exports = {
  resolvePathToTempDir,
  getUrlToHtmlFile,
  deleteFile,
  writeFile,
  readFile,
}
