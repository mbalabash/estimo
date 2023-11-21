#!/usr/bin/env node
import { Command } from 'commander'
import { resolve } from 'node:path'

import estimo from '../index.js'
import { isUrl } from '../src/utils.js'

const program = new Command()
program
  .requiredOption(
    '-r, --resources <string...>',
    'javascript files and/or web pages'
  )
  .option(
    '-device <string>',
    'puppeteer device descriptor to enable device emulation'
  )
  .option('-cpu <number>', 'slowdown factor to enable cpu throttling')
  .option(
    '-net <string>',
    'puppeteer network conditions descriptor to enable network emulation'
  )
  .option('-runs <number>', 'sets how many times estimo will run')
  .option(
    '-timeout <number>',
    'sets how long estimo will wait for page load (ms)'
  )
  .option('-diff', 'compare metrics of a first resource against others')

program.parse(process.argv)

const options = program.opts()
const settings = {
  cpuThrottlingRate: options.Cpu ? parseInt(options.Cpu, 10) : 1,
  device: options.Device || false,
  diff: options.Diff || false,
  emulateNetworkConditions: options.Net,
  runs: options.Runs ? parseInt(options.Runs, 10) : 1,
  timeout: options.Timeout || 20000
}

;(async () => {
  let resources = options.resources.map(lib =>
    isUrl(lib) ? lib : resolve(lib)
  )
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
