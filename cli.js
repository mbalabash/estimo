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
  .option('cpu', {
    describe: 'Enable CPU Throttling',
    type: 'boolean',
  })
  .option('cpuRate', {
    describe: 'Slowdown factor (e.g., 2 is a "2x" slowdown)',
    type: 'number',
  })
  .option('net', {
    describe: 'Enable Network Emulation',
    type: 'boolean',
  })
  .option('offline', {
    describe: 'Emulate a network disconnect',
    type: 'boolean',
  })
  .option('latency', {
    describe: 'Min latency between req and res in milliseconds',
    type: 'number',
  })
  .option('download', {
    describe: 'Max download speed in megabits per second',
    type: 'number',
  })
  .option('upload', {
    describe: 'Max upload speed in megabits per second',
    type: 'number',
  })
  .option('connection', {
    describe: 'Network connection type',
    type: 'string',
  })
  .help('h')
  .alias('h', 'help')
  .alias('v', 'version')
  .demandOption(['l'])

const estimo = require('./index')

;

(async () => {
  const { libs } = argv
  const options = {
    emulateCpuThrottling: argv.cpu || false,
    cpuThrottlingRate: argv.cpuRate || 1,
    emulateNetworkConditions: argv.net || false,
    offline: argv.offline || false,
    latency: argv.latency || 0,
    downloadThroughput: argv.download || 0,
    uploadThroughput: argv.upload || 0,
    connectionType: argv.connection || 'none',
  }
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
