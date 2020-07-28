const estimo = require('./src/lib')
const { generatePrettyReport } = require('./src/reporter')
const { processor } = require('./src/processor')

module.exports = estimo
module.exports.processor = processor
module.exports.generatePrettyReport = generatePrettyReport
