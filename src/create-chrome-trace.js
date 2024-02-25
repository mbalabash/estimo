import { nanoid } from 'nanoid'
import puppeteer from 'puppeteer-core'

import { resolvePathToTempDir } from './utils.js'

const defaultBrowserOptions = {
  headless: true,
  timeout: 20000
}

const chromeLaunchArgs = [
  '--no-sandbox',
  '--incognito',
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
    args: chromeLaunchArgs,
    executablePath: options.executablePath,
    headless: options.headless,
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
      height: options.height,
      width: options.width
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

export async function createChromeTrace(resources, browserOptions) {
  let options = { ...defaultBrowserOptions, ...browserOptions }
  let resourcesWithTrace = []
  let browser
  let context
  let page

  try {
    browser = await createBrowserEntity(options)
    context = await browser.createBrowserContext()

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
