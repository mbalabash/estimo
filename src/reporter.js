const bigrig = require('bigrig')
const { readFile } = require('./utils')

async function generateReadableReport(pathToTimelines) {
  const content = await readFile(pathToTimelines)
  const report = bigrig.analyze(content)
  return report
}

module.exports = { generateReadableReport }
