const path = require('path')
const estimo = require('../../index')
const { calcStats } = require('./utils')

;

(async () => {
  const times = []
  for (let i = 0; i < 1000; i += 1) {
    const start = Date.now()
    await estimo(path.resolve(path.join(__dirname, '../lib/2kb.js')))
    const finish = Date.now()
    times.push((finish - start) / 1000)
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
