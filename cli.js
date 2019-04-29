#!/usr/bin/env node
const path = require('path')
const { argv } = require('yargs')
  .scriptName('estimo')
  .usage('Usage: $0 [options]')
  .showHelpOnFail(true)
  .option('l', {
    alias: 'libs',
    describe: 'JavaScript files for evaluates',
    type: 'array',
    demand: true,
  })
  .option('p', {
    alias: 'perfOptions',
    describe: 'CPU and Network throttling options',
    type: 'string',
  })
  .help('h')
  .alias('h', 'help')
  .alias('v', 'version')
  .demandOption(['l'])

const estimo = require('./index')

;

(async () => {
  const { libs, perfOptions } = argv
  const options = perfOptions || {}
  const files = libs.map((lib) => {
    if (/^http/.test(lib)) {
      return lib
    }
    return path.resolve(lib)
  })

  const startTime = Date.now()
  const report = await estimo(files, options)
  const finishTime = Date.now()

  console.log(report)
  console.log(`Done in ${parseInt(finishTime - startTime, 10)} ms.`)

  return report
})()
