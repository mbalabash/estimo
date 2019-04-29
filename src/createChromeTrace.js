const puppeteer = require('puppeteer')
const { megabitsToBytes } = require('./utils')

const defaultBrowserOptions = {
  _headless: true,
  _waitUntil: 'load',
  _timeout: 30000,
  emulateNetworkConditions: false,
  emulateCpuThrottling: false,
  offline: false,
  latency: 0,
  downloadThroughput: 0,
  uploadThroughput: 0,
  connectionType: 'none',
  cpuThrottlingRate: 1,
}

function handleSessionError(err, browser) {
  if (err) console.error(err)
  if (browser && browser.constructor && browser.constructor.name === 'Browser') {
    browser.close()
  }
  process.exit(1)
}

async function createChromeTrace(urlToHtmlFile, pathToTraceFile, browserOptions) {
  const options = { ...defaultBrowserOptions, ...browserOptions }
  const { _headless: headless, emulateNetworkConditions, emulateCpuThrottling } = options

  const browser = await puppeteer.launch({ headless })
  const page = await browser.newPage()
  const client = await page.target().createCDPSession()

  if (emulateNetworkConditions) {
    const {
      offline, latency, downloadThroughput, uploadThroughput, connectionType,
    } = options
    await client.send('Network.emulateNetworkConditions', {
      offline,
      latency,
      downloadThroughput: megabitsToBytes(downloadThroughput),
      uploadThroughput: megabitsToBytes(uploadThroughput),
      connectionType,
    })
  }

  if (emulateCpuThrottling) {
    const { cpuThrottlingRate } = options
    await client.send('Emulation.setCPUThrottlingRate', { rate: cpuThrottlingRate })
  }

  await page.tracing.start({ path: pathToTraceFile })
  try {
    const { _timeout: timeout, _waitUntil: waitUntil } = options
    await page.goto(urlToHtmlFile, { timeout, waitUntil })
  } catch (err) {
    handleSessionError(err, browser)
  }
  await page.tracing.stop()

  await browser.close()
  return pathToTraceFile
}

module.exports = { createChromeTrace }
