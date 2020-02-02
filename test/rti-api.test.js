const test = require('ava')
const path = require('path')
const { execSync } = require('child_process')
const { findChrome } = require('../scripts/chromeDetection')
const { createChromeTrace } = require('../src/create-chrome-trace')
const { writeFile, getUrlToHtmlFile, removeAllFiles } = require('../src/utils')

test('[rti-api]: should contain "tidelta" and "ticount" in mock trace file', t => {
  const pathToMockTraceFileWithRtiData = path.join(__dirname, '__mock__', 'rti-trace.json')

  if (process.platform !== 'win32') {
    const tideltaGrepResult = execSync(
      `grep 'tidelta' ${pathToMockTraceFileWithRtiData}`
    ).toString()
    const ticountGrepResult = execSync(
      `grep 'ticount' ${pathToMockTraceFileWithRtiData}`
    ).toString()

    t.is(tideltaGrepResult.length > 0, true)
    t.is(tideltaGrepResult.includes('"tidelta":'), true)

    t.is(ticountGrepResult.length > 0, true)
    t.is(ticountGrepResult.includes('"ticount":'), true)
  } else {
    t.is('API Not Supported', 'API Not Supported')
  }
})

test('[rti-api]: should not contain "tidelta" and "ticount" in trace file if API does not support by the platform', async t => {
  const chromeLocation = await findChrome()
  const page = getUrlToHtmlFile(path.join(__dirname, '__mock__', 'test.html'))

  let resources = [{ name: page, url: page }]
  resources = await createChromeTrace(resources, { executablePath: chromeLocation })
  const pathToTraceFile = resources[0].trace

  const error = t.throws(() => execSync(`grep 'tidelta' ${pathToTraceFile}`).toString())
  t.is(error instanceof Error, true)
  t.is(error.status, 1)
  if (process.platform !== 'win32') {
    t.is(error.message, `Command failed: grep 'tidelta' ${pathToTraceFile}`)
  }

  await removeAllFiles(resources.map(file => file.trace))
  await removeAllFiles(resources.map(file => file.html))
  await writeFile(path.join(__dirname, '..', 'chrome.json'), '{ "executablePath": "" }')
})
