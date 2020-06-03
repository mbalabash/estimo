const estimo = require('./src/lib')
const { generatePrettyReport } = require('./src/reporter')
const { estimoJsMode } = require('./src/js-mode')
const { estimoPageMode } = require('./src/page-mode')

module.exports = estimo
module.exports.estimoJsMode = estimoJsMode
module.exports.estimoPageMode = estimoPageMode
module.exports.generatePrettyReport = generatePrettyReport
