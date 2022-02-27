const test = require('ava')
const path = require('path')

const {
  splitResourcesForEstimo,
  resolvePathToTempDir,
  getUrlToHtmlFile,
  findChromeBinary,
  checkEstimoArgs,
  getLibraryName,
  createDiff,
  readFile,
  isJsFile,
  isUrl
} = require('../src/utils')
const { cleanChromeConfig } = require('../scripts/clean-chrome-config')

test('[resolvePathToTempDir]: should properly resolve path to file in temp directory', t => {
  let fileName = 'someFile.txt'
  let customTempDir = '../test/__mock__/'

  t.is(
    resolvePathToTempDir(fileName),
    path.join(__dirname, '../temp/', fileName)
  )

  t.is(
    resolvePathToTempDir(fileName, customTempDir),
    path.join(__dirname, customTempDir, fileName)
  )
})

test('[getUrlToHtmlFile]: should properly generate url to local file', t => {
  let fileName = 'index.html'
  t.is(
    getUrlToHtmlFile(resolvePathToTempDir(fileName)),
    `file://${path.join(__dirname, '../temp/', fileName)}`
  )
})

test('[createDiff]: should properly create diff', async t => {
  t.is(createDiff(100894, 110894), '-9.92% 🔽')
  t.is(createDiff(0.2021099999999999, 0.10210999999999999), '+49.48% 🔺')
  t.is(createDiff(2.5658984375, 2.1658984375), '+15.59% 🔺')
  t.is(createDiff(2.7680084375000003, 2.2680084375000003), '+18.07% 🔺')
  t.is(createDiff(1000, 100), '+90% 🔺')
})

test('[getLibraryName]: should properly extract library name', async t => {
  t.is(getLibraryName('http://qwe.asd/myLib.js'), 'myLib.js')
  t.is(getLibraryName('http://qwe.asd/myLib/some/dir/lib.js'), 'lib.js')
  t.is(getLibraryName('https://qwe.asd/myLib.js'), 'myLib.js')
  t.is(getLibraryName('https://qwe.asd/myLib/core.js'), 'core.js')
  t.is(getLibraryName('./dir/dev/lib/index.js'), 'index.js')
  t.is(getLibraryName('/Users/dev/project/myLib.js'), 'myLib.js')
  t.is(getLibraryName('../myLib.js'), 'myLib.js')
})

test('[isJsFile]: should properly detect js file names', async t => {
  t.is(isJsFile('http://qwe.asd/myLib.js'), true)
  t.is(isJsFile('https://qwe.asd/myLib.js'), true)
  t.is(isJsFile('temp/dir/core.js'), true)
  t.is(isJsFile('index.js'), true)
  t.is(isJsFile('./dev/project/myLib.mjs'), true)

  t.is(isJsFile('qwe/asd.css'), false)
  t.is(isJsFile('cvxvx/qw.html'), false)
})

test("[isUrl]: should properly detect web url's", async t => {
  t.is(isUrl('http://qwe.asd/myLib.js'), true)
  t.is(isUrl('https://qwe.asd/myLib.js'), true)
  t.is(isUrl('http://qwe.asd/qwe.css'), true)
  t.is(isUrl('https://qwe.asd/zxc.html'), true)

  t.is(isUrl('qwe/asd/'), false)
  t.is(isUrl('ftp://domain.to/'), false)
  t.is(isUrl('index.js'), false)
})

test("[splitResourcesForEstimo]: should properly split input to js files and non-js web url's", async t => {
  t.deepEqual(
    splitResourcesForEstimo(['https://qwe.asd/myLib.js', 'index.js']),
    {
      pages: [],
      libraries: ['https://qwe.asd/myLib.js', 'index.js']
    }
  )

  t.deepEqual(splitResourcesForEstimo(['http://qwe.asd/myLib.js']), {
    pages: [],
    libraries: ['http://qwe.asd/myLib.js']
  })

  t.deepEqual(
    splitResourcesForEstimo(['http://example.com/', 'https://example.com/']),
    {
      pages: ['http://example.com/', 'https://example.com/'],
      libraries: []
    }
  )

  t.deepEqual(
    splitResourcesForEstimo([
      'http://qwe.asd/qwe.css',
      'https://qwe.asd/zxc.html',
      'http://qwe.asd/myLib.js',
      'index.js'
    ]),
    {
      pages: ['http://qwe.asd/qwe.css', 'https://qwe.asd/zxc.html'],
      libraries: ['http://qwe.asd/myLib.js', 'index.js']
    }
  )

  t.deepEqual(splitResourcesForEstimo([]), { pages: [], libraries: [] })

  let error = t.throws(() =>
    splitResourcesForEstimo(['ftp://domain.to/', 'qwe/asd/'])
  )
  t.is(
    error.message,
    'Estimo works only with resources which are (paths to Js files) OR (urls to Web pages) (<String> OR <Array<String>>)'
  )
})

test('[checkEstimoArgs]: should properly handle input args', async t => {
  t.is(
    t.throws(() => checkEstimoArgs(123)).message,
    'The first argument should be String or Array<String> which contains a path to the resource (Js file or Web page).'
  )
  t.is(
    t.throws(() => checkEstimoArgs(undefined)).message,
    'The first argument should be String or Array<String> which contains a path to the resource (Js file or Web page).'
  )
  t.is(
    t.throws(() => checkEstimoArgs(null)).message,
    'The first argument should be String or Array<String> which contains a path to the resource (Js file or Web page).'
  )
  t.is(
    t.throws(() => checkEstimoArgs({})).message,
    'The first argument should be String or Array<String> which contains a path to the resource (Js file or Web page).'
  )

  t.is(
    t.throws(() => checkEstimoArgs([])).message,
    'All resources should be represented as a <String> path to the resource (Js file or Web page).'
  )
  t.is(
    t.throws(() => checkEstimoArgs(['lib', 'vc', 123])).message,
    'All resources should be represented as a <String> path to the resource (Js file or Web page).'
  )

  t.is(
    t.throws(() => checkEstimoArgs(['lib'], [])).message,
    'The second argument should be an Object which contains browser options (see https://github.com/mbalabash/estimo#additional-use-cases).'
  )
  t.is(
    t.throws(() => checkEstimoArgs(['lib'], new Date())).message,
    'The second argument should be an Object which contains browser options (see https://github.com/mbalabash/estimo#additional-use-cases).'
  )
  t.is(
    t.throws(() => checkEstimoArgs(['lib'], null)).message,
    'The second argument should be an Object which contains browser options (see https://github.com/mbalabash/estimo#additional-use-cases).'
  )
  t.is(
    t.throws(() => checkEstimoArgs(['lib'], undefined)).message,
    'The second argument should be an Object which contains browser options (see https://github.com/mbalabash/estimo#additional-use-cases).'
  )
  t.is(
    t.throws(() => checkEstimoArgs(['lib'], 123)).message,
    'The second argument should be an Object which contains browser options (see https://github.com/mbalabash/estimo#additional-use-cases).'
  )
})

test('should set location setting for downloaded or local chrome', async t => {
  let chromeInfo = await findChromeBinary()
  let configData = JSON.parse(
    await readFile(path.join(__dirname, '..', 'chrome.json'))
  )

  t.is(
    typeof chromeInfo === 'object' && Object.keys(chromeInfo).length === 2,
    true
  )
  t.is(configData.browser.length > 0, true)
  t.is(configData.executablePath.length > 0, true)
  t.is(configData.executablePath === chromeInfo.executablePath, true)

  await cleanChromeConfig()
})
