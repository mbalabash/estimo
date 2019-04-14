const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const { promisify } = require('util')

const write = promisify(fs.writeFile)

const writeFile = async (fileName, content) => {
  const targetPath = path.join('.', fileName)
  try {
    await write(targetPath, content)
  } catch (error) {
    console.error(chalk.red(error.stack))
  }
}

const getUrlToHtmlFile = fileName => `file://${path.resolve(path.join('.', fileName))}`

const getTimelinesFilePath = (args) => {
  const optionIndx = args.indexOf('--path')
  return path.resolve(args[optionIndx + 1])
}

module.exports = { writeFile, getUrlToHtmlFile, getTimelinesFilePath }
