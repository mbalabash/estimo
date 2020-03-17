#!/usr/bin/env node
const path = require('path')
const { argv } = require('yargs')
  .scriptName('estimo')
  .usage('Usage: $0 [options]')
  .showHelpOnFail(true)
  .option('r', {
    alias: 'resources',
    describe: 'JavaScript files or Web pages',
    type: 'array',
    demand: true,
  })
  .option('d', {
    alias: 'device',
    describe: 'Enable Device Emulation',
    type: 'string',
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
  .demandOption(['r'])

const { isUrl } = require('../src/utils')
const estimo = require('../index')

// eslint-disable-next-line import/newline-after-import
;(async () => {
  const { resources } = argv
  const options = {
    device: argv.device || false,
    emulateCpuThrottling: argv.cpu || false,
    cpuThrottlingRate: argv.cpuRate || 1,
    emulateNetworkConditions: argv.net || false,
    offline: argv.offline || false,
    latency: argv.latency || 0,
    downloadThroughput: argv.download || 0,
    uploadThroughput: argv.upload || 0,
    connectionType: argv.connection || 'none',
  }

  const files = resources.map(lib => {
    if (isUrl(lib)) {
      return lib
    }
    return path.resolve(lib)
  })

  let report = null

  try {
    const startTime = Date.now()
    report = await estimo(files, options)
    const finishTime = Date.now()

    console.log(report)
    console.log(`Done in ${parseInt(finishTime - startTime, 10)} ms.`)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }

  return report
})()
