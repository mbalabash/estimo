const test = require('ava')
const path = require('path')
const {
  splitResourcesForEstimo,
  resolvePathToTempDir,
  getUrlToHtmlFile,
  megabitsToBytes,
  checkEstimoArgs,
  getLibraryName,
  isJsFile,
  isUrl,
} = require('../src/utils')

test('[resolvePathToTempDir]: should properly resolve path to file in temp directory', (t) => {
  const fileName = 'someFile.txt'
  const customTempDir = '../test/__mock__/'

  t.is(resolvePathToTempDir(fileName), path.join(__dirname, '../temp/', fileName))

  t.is(resolvePathToTempDir(fileName, customTempDir), path.join(__dirname, customTempDir, fileName))
})

test('[getUrlToHtmlFile]: should properly generate url to local file', (t) => {
  const fileName = 'index.html'
  t.is(
    getUrlToHtmlFile(resolvePathToTempDir(fileName)),
    `file://${path.join(__dirname, '../temp/', fileName)}`
  )
})

test('[megabitsToBytes]: should properly transform megabits to bytes', async (t) => {
  t.is(megabitsToBytes(0.75), 98304)
  t.is(megabitsToBytes(1.6), 209715.2)
  t.is(megabitsToBytes(13), 1703936)
  t.is(megabitsToBytes(0.33), 43253.76)
})

test('[getLibraryName]: should properly extract library name', async (t) => {
  t.is(getLibraryName('http://qwe.asd/myLib.js'), 'myLib.js')
  t.is(getLibraryName('http://qwe.asd/myLib/some/dir/lib.js'), 'lib.js')
  t.is(getLibraryName('https://qwe.asd/myLib.js'), 'myLib.js')
  t.is(getLibraryName('https://qwe.asd/myLib/core.js'), 'core.js')
  t.is(getLibraryName('./dir/dev/lib/index.js'), 'index.js')
  t.is(getLibraryName('/Users/dev/project/myLib.js'), 'myLib.js')
  t.is(getLibraryName('../myLib.js'), 'myLib.js')
})

test('[isJsFile]: should properly detect js file names', async (t) => {
  t.is(isJsFile('http://qwe.asd/myLib.js'), true)
  t.is(isJsFile('https://qwe.asd/myLib.js'), true)
  t.is(isJsFile('temp/dir/core.js'), true)
  t.is(isJsFile('index.js'), true)
  t.is(isJsFile('./dev/project/myLib.mjs'), true)

  t.is(isJsFile('qwe/asd.css'), false)
  t.is(isJsFile('cvxvx/qw.html'), false)
})

test("[isUrl]: should properly detect web url's", async (t) => {
  t.is(isUrl('http://qwe.asd/myLib.js'), true)
  t.is(isUrl('https://qwe.asd/myLib.js'), true)
  t.is(isUrl('http://qwe.asd/qwe.css'), true)
  t.is(isUrl('https://qwe.asd/zxc.html'), true)

  t.is(isUrl('qwe/asd/'), false)
  t.is(isUrl('ftp://domain.to/'), false)
  t.is(isUrl('index.js'), false)
})

test("[splitResourcesForEstimo]: should properly split input to js files and non-js web url's", async (t) => {
  t.deepEqual(splitResourcesForEstimo(['https://qwe.asd/myLib.js', 'index.js']), {
    pages: [],
    libraries: ['https://qwe.asd/myLib.js', 'index.js'],
  })

  t.deepEqual(splitResourcesForEstimo(['http://qwe.asd/myLib.js']), {
    pages: [],
    libraries: ['http://qwe.asd/myLib.js'],
  })

  t.deepEqual(splitResourcesForEstimo(['http://example.com/', 'https://example.com/']), {
    pages: ['http://example.com/', 'https://example.com/'],
    libraries: [],
  })

  t.deepEqual(
    splitResourcesForEstimo([
      'http://qwe.asd/qwe.css',
      'https://qwe.asd/zxc.html',
      'http://qwe.asd/myLib.js',
      'index.js',
    ]),
    {
      pages: ['http://qwe.asd/qwe.css', 'https://qwe.asd/zxc.html'],
      libraries: ['http://qwe.asd/myLib.js', 'index.js'],
    }
  )

  t.deepEqual(splitResourcesForEstimo([]), { pages: [], libraries: [] })

  const error = t.throws(() => splitResourcesForEstimo(['ftp://domain.to/', 'qwe/asd/']))
  t.is(
    error.message,
    'Estimo works only with resources which are (paths to Js files) OR (urls to Web pages) (<String> OR <Array<String>>)'
  )
})

test('[checkEstimoArgs]: should properly handle input args', async (t) => {
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
