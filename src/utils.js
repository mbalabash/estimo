const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const write = promisify(fs.writeFile)
const read = promisify(fs.readFile)

const writeFile = async (fileName, content) => {
  const targetPath = path.join(__dirname, '..', fileName)
  try {
    await write(targetPath, content)
  } catch (error) {
    console.error(error.stack)
    process.exit(1)
  }
}

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

const getUrlToHtmlFile = fileName => `file://${path.resolve(path.join(__dirname, '..', fileName))}`

const getTimelinesFilePath = (args) => {
  const optionIndx = args.indexOf('--path')
  return path.resolve(args[optionIndx + 1])
}

const deleteFile = (filePath) => {
  const targetPath = path.join(__dirname, '..', filePath)
  try {
    fs.unlinkSync(targetPath)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

module.exports = {
  readFile,
  writeFile,
  getUrlToHtmlFile,
  deleteFile,
  getTimelinesFilePath,
}
