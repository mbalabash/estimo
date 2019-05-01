/* eslint-disable no-await-in-loop */
const path = require('path')
const estimo = require('../index')
const { median } = require('./median')

;

(async () => {
  const times = []
  for (let i = 0; i < 100; i += 1) {
    const report = await estimo(path.resolve(path.join(__dirname, './lib/280kb.js')))
    times.push(report.javaScript)
  }

  const sorted = times.sort((a, b) => a - b)

  console.log('Tested 100 times (js total time)')
  console.log(`Min: ${sorted[0]} ms.`)
  console.log(`Median: ${median(sorted)} ms.`)
  console.log(`Max: ${sorted[sorted.length - 1]} ms.`)
})()
