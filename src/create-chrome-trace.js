const { nanoid } = require('nanoid')
const puppeteer = require('puppeteer-core')

const { resolvePathToTempDir } = require('./utils')

const defaultBrowserOptions = {
  headless: true,
  timeout: 20000
}

const chromeLaunchArgs = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage'
]

async function createBrowserEntity(options) {
  if (options.executablePath.length === 0) {
    throw new Error(
      `Chromium revision is not found or downloaded. Check that access to file system is permitted or file an issue here: https://github.com/mbalabash/estimo`
    )
  }

  if (options.width && options.height) {
    chromeLaunchArgs.push(`--window-size=${options.width},${options.height}`)
  }
  let browserConfig = {
    headless: options.headless,
    executablePath: options.executablePath,
    args: chromeLaunchArgs,
    ignoreDefaultArgs: ['--disable-extensions']
  }
  if (process.env.ESTIMO_DEBUG) {
    browserConfig.dumpio = true
  }

  return await puppeteer.launch(browserConfig)
}

async function createPageEntity(context, options) {
  let page = await context.newPage()

  if (options.emulateNetworkConditions) {
    await page.emulateNetworkConditions(
      puppeteer.networkConditions[options.emulateNetworkConditions]
    )
  }
  if (options.cpuThrottlingRate) {
    await page.emulateCPUThrottling(options.cpuThrottlingRate)
  }
  if (options.userAgent) {
    await page.setUserAgent(options.userAgent)
  }
  if (options.width && options.height) {
    await page.setViewport({
      width: options.width,
      height: options.height
    })
  }
  if (options.device) {
    if (puppeteer.devices[options.device]) {
      await page.emulate(puppeteer.devices[options.device])
    } else {
      throw new Error(`${options.device} - unknown Device option!`)
    }
  }

  page.on('error', msg => {
    throw msg
  })

  return page
}

async function createChromeTrace(resources, browserOptions) {
  let options = { ...defaultBrowserOptions, ...browserOptions }
  let resourcesWithTrace = []
  let browser
  let context
  let page

  try {
    browser = await createBrowserEntity(options)
    context = await browser.createIncognitoBrowserContext()

    for (let item of resources) {
      page = await createPageEntity(context, options)

      let traceFile = resolvePathToTempDir(`${nanoid()}.json`)

      await page.tracing.start({ path: traceFile })
      await page.goto(item.url, { timeout: options.timeout })
      await page.tracing.stop()
      await page.close()

      resourcesWithTrace.push({ ...item, tracePath: traceFile })
    }
  } catch (error) {
    console.error(error)
  } finally {
    if (browser) {
      let pages = await browser.pages()
      await Promise.all(pages.map(item => item.close()))

      if (context) {
        await context.close()
      }

      await browser.close()
    }
  }

  return resourcesWithTrace
}

module.exports = { createChromeTrace }
