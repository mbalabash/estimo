const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const write = promisify(fs.writeFile)
const read = promisify(fs.readFile)
const unlink = promisify(fs.unlink)

const preparePathForTempDir = fileName => path.join(__dirname, '../temp/', fileName)

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

const writeFile = async (fileName, content) => {
  const targetPath = preparePathForTempDir(fileName)
  try {
    await write(targetPath, content)
  } catch (error) {
    console.error(error.stack)
    process.exit(1)
  }
}

const deleteFile = async (fileName) => {
  const targetPath = preparePathForTempDir(fileName)
  try {
    await unlink(targetPath)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

const getUrlToHtmlFile = fileName => `file://${path.resolve(preparePathForTempDir(fileName))}`

module.exports = {
  preparePathForTempDir,
  getUrlToHtmlFile,
  deleteFile,
  writeFile,
  readFile,
}
