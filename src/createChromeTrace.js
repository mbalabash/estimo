const puppeteer = require('puppeteer-core')
const nanoid = require('nanoid')
const { getUrlToHtmlFile, megabitsToBytes, resolvePathToTempDir } = require('./utils')
const chromeConfig = require('../chrome.json')

const defaultBrowserOptions = {
  headless: true,
  timeout: 30000,
  emulateNetworkConditions: false,
  emulateCpuThrottling: false,
  offline: false,
  latency: 0,
  downloadThroughput: 0,
  uploadThroughput: 0,
  connectionType: 'none',
  cpuThrottlingRate: 1,
  executablePath: chromeConfig.executablePath,
}

function handleSessionError(err, browser) {
  if (err) console.error(err)
  if (browser && browser.constructor && browser.constructor.name === 'Browser') {
    browser.close()
  }
  process.exit(1)
}

async function createChromeTrace(htmlFiles, browserOptions) {
  const options = { ...defaultBrowserOptions, ...browserOptions }
  const { headless, emulateNetworkConditions, emulateCpuThrottling, executablePath } = options

  // Create Chrome entities
  const browser = await puppeteer.launch({
    headless,
    executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  const page = await browser.newPage()
  const client = await page.target().createCDPSession()

  // Enable Network Emulation
  if (emulateNetworkConditions) {
    await client.send('Network.emulateNetworkConditions', {
      offline: options.offline,
      latency: options.latency,
      downloadThroughput: megabitsToBytes(options.downloadThroughput),
      uploadThroughput: megabitsToBytes(options.uploadThroughput),
      connectionType: options.connectionType,
    })
  }

  // Enable CPU Emulation
  if (emulateCpuThrottling) {
    const { cpuThrottlingRate } = options
    await client.send('Emulation.setCPUThrottlingRate', { rate: cpuThrottlingRate })
  }

  // Generate trace files
  const traceFiles = []
  for (const lib of htmlFiles) {
    const traceFile = resolvePathToTempDir(`${nanoid()}.json`)
    await page.tracing.start({ path: traceFile })
    try {
      await page.goto(getUrlToHtmlFile(lib.html), { timeout: options.timeout })
    } catch (err) {
      handleSessionError(err, browser)
    }
    await page.tracing.stop()
    traceFiles.push({ name: lib.name, traceFile })
  }
  await browser.close()

  return traceFiles
}

module.exports = { createChromeTrace }
