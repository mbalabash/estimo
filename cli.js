#!/usr/bin/env node
const path = require('path')
const { argv } = require('yargs')
  .scriptName('estimo')
  .usage('Usage: $0 [options]')
  .showHelpOnFail(true)
  .option('l', {
    alias: 'libs',
    describe: 'Libraries for estimation',
    type: 'array',
    demand: true,
  })
  .option('perfCliArgs', {
    describe: 'perf-timeline-cli options',
    type: 'string',
  })
  .help('h')
  .alias('h', 'help')
  .alias('v', 'version')
  .demandOption(['l'])

const estimo = require('./index')

;

(async () => {
  const { libs, perfCliArgs } = argv
  const options = perfCliArgs || ''
  const files = libs.map((lib) => {
    if (lib.includes('http://') || lib.includes('https://')) {
      return lib
    }
    return path.resolve(lib)
  })
  const report = await estimo(files, options.split(' '))
  console.log(report)
  return report
})()
