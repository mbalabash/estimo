const puppeteer = require('puppeteer')

const defaultBrowserOptions = {
  headless: true,
  waitUntil: 'load',
  timeout: 30000,
  emulateNetworkConditions: false,
  emulateCpuThrottling: false,
  networkConditions: {
    offline: false,
    latency: 0,
    downloadThroughput: 0,
    uploadThroughput: 0,
    connectionType: 'none',
  },
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
  const { headless, emulateNetworkConditions, emulateCpuThrottling } = options

  const browser = await puppeteer.launch({ headless })
  const page = await browser.newPage()
  const client = await page.target().createCDPSession()

  if (emulateNetworkConditions) {
    const { networkConditions } = options
    await client.send('Network.emulateNetworkConditions', networkConditions)
  }

  if (emulateCpuThrottling) {
    const { cpuThrottlingRate } = options
    await client.send('Emulation.setCPUThrottlingRate', { rate: cpuThrottlingRate })
  }

  await page.tracing.start({ path: pathToTraceFile })
  try {
    await page.goto(urlToHtmlFile, {
      timeout: options.timeout,
      waitUntil: options.waitUntil,
    })
  } catch (err) {
    handleSessionError(err, browser)
  }
  await page.tracing.stop()

  await browser.close()
  return pathToTraceFile
}

module.exports = { createChromeTrace }
