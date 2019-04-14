const bigrig = require('bigrig')
const { readFile } = require('./utils')

const generateReadableReport = async (pathToTimelines) => {
  const content = await readFile(pathToTimelines)
  const report = bigrig.analyze(content)
  return report
}

module.exports = { generateReadableReport }
