#!/usr/bin/env node
const { resolve } = require('path')
const { Command } = require('commander')

const { isUrl } = require('../src/utils')
const estimo = require('../index')

const program = new Command()

program
  .requiredOption('-r, --resources <string...>', 'javascript files and/or web pages')
  .option('-device <string>', 'puppeteer device descriptor to enable device emulation')
  .option('-cpu <number>', 'slowdown factor to enable cpu throttling')
  .option('-net <string>', 'puppeteer network conditions descriptor to enable network emulation')
  .option('-runs <number>', 'sets how many times estimo will run')
  .option('-timeout <number>', 'sets how long estimo will wait for page load (ms)')
  .option('-diff', 'compare metrics of a first resource against others')
  .version(require('../package.json').version)

program.parse(process.argv)

const options = program.opts()
const settings = {
  device: options.Device || false,
  diff: options.Diff || false,
  runs: options.Runs ? parseInt(options.Runs, 10) : 1,
  cpuThrottlingRate: options.Cpu ? parseInt(options.Cpu, 10) : 1,
  emulateNetworkConditions: options.Net,
  timeout: options.Timeout || 20000,
}

;(async () => {
  let resources = options.resources.map((lib) => (isUrl(lib) ? lib : resolve(lib)))
  let report = null

  try {
    let startTime = Date.now()
    report = await estimo(resources, settings)
    let finishTime = Date.now()

    console.log(report)
    console.log(`Done in ${parseInt(finishTime - startTime, 10)} ms.`)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }

  return report
})()
