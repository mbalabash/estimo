const path = require('path')
const estimo = require('../index')

;

(async () => {
  const report = await estimo(path.resolve(path.join(__dirname, './lib/2kb.js')))
  console.log(report)
})()
