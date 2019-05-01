/* eslint-disable no-await-in-loop */
const path = require('path')
const estimo = require('../index')
const { median } = require('./median')

;

(async () => {
  const times = []
  for (let i = 0; i < 1000; i += 1) {
    const start = Date.now()
    await estimo(path.resolve(path.join(__dirname, './lib/2kb.js')))
    const finish = Date.now()
    times.push((finish - start) / 1000)
  }

  const sorted = times.sort((a, b) => a - b)

  console.log('Tested 1000 times (estimo duration)')
  console.log(`Min: ${sorted[0]} s.`)
  console.log(`Median: ${median(sorted)} s.`)
  console.log(`Max: ${sorted[sorted.length - 1]} s.`)
})()
