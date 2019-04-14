const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const { promisify } = require('util')

const write = promisify(fs.writeFile)
const read = promisify(fs.readFile)

const writeFile = async (fileName, content) => {
  const targetPath = path.join('.', fileName)
  try {
    await write(targetPath, content)
  } catch (error) {
    console.error(chalk.red(error.stack))
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
    console.error(chalk.red(error.stack))
    return process.exit(1)
  }
}

const getUrlToHtmlFile = fileName => `file://${path.resolve(path.join('.', fileName))}`

const getTimelinesFilePath = (args) => {
  const optionIndx = args.indexOf('--path')
  return path.resolve(args[optionIndx + 1])
}

module.exports = {
  readFile,
  writeFile,
  getUrlToHtmlFile,
  getTimelinesFilePath,
}
