const path = require('path')
const estimo = require('../../index')
const { calcStats } = require('./utils')

;

(async () => {
  const times = []
  for (let i = 0; i < 100; i += 1) {
    const report = await estimo(path.resolve(path.join(__dirname, '../lib/1.4mb.js')))
    times.push(report[0].javaScript)
  }

  const {
    min, mid, max, discrepancy,
  } = calcStats(times)

  console.log('Tested 100 times (js total time)')
  console.log(`Min: ${min} ms.`)
  console.log(`Median: ${mid} ms.`)
  console.log(`Max: ${max} ms.`)
  console.log(`Discrepancy: ${discrepancy}`)
})()
