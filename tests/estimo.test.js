const test = require('ava')
const path = require('path')

const estimo = require('../src/lib')
const { getUrlToHtmlFile, findChromeBinary } = require('../src/utils')
const { cleanChromeConfig } = require('../scripts/clean-chrome-config')

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

test('estimo - should works properly with mixed resources', async t => {
  let chromeInfo = await findChromeBinary()

  let page = getUrlToHtmlFile(path.join(__dirname, '__mock__', 'test.html'))
  let lib = path.join(__dirname, '__mock__', '19kb.js')

  let reports = await estimo([lib, page], {
    executablePath: chromeInfo.executablePath
  })

  t.is(reports[0].name, '19kb.js')
  t.is(
    typeof reports[0].parseHTML === 'number' && reports[0].parseHTML >= 0,
    true
  )
  t.is(
    typeof reports[0].styleLayout === 'number' && reports[0].styleLayout >= 0,
    true
  )
  t.is(
    typeof reports[0].paintCompositeRender === 'number' &&
      reports[0].paintCompositeRender >= 0,
    true
  )
  t.is(
    typeof reports[0].scriptParseCompile === 'number' &&
      reports[0].scriptParseCompile >= 0,
    true
  )
  t.is(
    typeof reports[0].scriptEvaluation === 'number' &&
      reports[0].scriptEvaluation >= 0,
    true
  )
  t.is(
    typeof reports[0].javaScript === 'number' && reports[0].javaScript > 0,
    true
  )
  t.is(
    typeof reports[0].garbageCollection === 'number' &&
      reports[0].garbageCollection >= 0,
    true
  )
  t.is(typeof reports[0].other === 'number' && reports[0].other >= 0, true)
  t.is(typeof reports[0].total === 'number' && reports[0].total > 0, true)

  t.is(reports[1].name, page)
  t.is(
    typeof reports[1].parseHTML === 'number' && reports[1].parseHTML >= 0,
    true
  )
  t.is(
    typeof reports[1].styleLayout === 'number' && reports[1].styleLayout >= 0,
    true
  )
  t.is(
    typeof reports[1].paintCompositeRender === 'number' &&
      reports[1].paintCompositeRender >= 0,
    true
  )
  t.is(
    typeof reports[1].scriptParseCompile === 'number' &&
      reports[1].scriptParseCompile >= 0,
    true
  )
  t.is(
    typeof reports[1].scriptEvaluation === 'number' &&
      reports[1].scriptEvaluation >= 0,
    true
  )
  t.is(
    typeof reports[1].javaScript === 'number' && reports[1].javaScript > 0,
    true
  )
  t.is(
    typeof reports[1].garbageCollection === 'number' &&
      reports[1].garbageCollection >= 0,
    true
  )
  t.is(typeof reports[1].other === 'number' && reports[1].other >= 0, true)
  t.is(typeof reports[1].total === 'number' && reports[1].total > 0, true)

  await cleanChromeConfig()
})

test('estimo - should works properly with custom RUNS option', async t => {
  let chromeInfo = await findChromeBinary()

  let lib1 = path.join(__dirname, '__mock__', '19kb.js')
  let page1 = getUrlToHtmlFile(path.join(__dirname, '__mock__', 'test.html'))

  let reports1 = await estimo([lib1], {
    executablePath: chromeInfo.executablePath,
    runs: 3
  })
  await delay(1000)
  let reports2 = await estimo([page1], {
    executablePath: chromeInfo.executablePath,
    runs: 2
  })

  t.is(reports1.length, 1)
  t.is(
    typeof reports1[0].parseHTML === 'number' && reports1[0].parseHTML >= 0,
    true
  )
  t.is(
    typeof reports1[0].styleLayout === 'number' && reports1[0].styleLayout >= 0,
    true
  )
  t.is(
    typeof reports1[0].paintCompositeRender === 'number' &&
      reports1[0].paintCompositeRender >= 0,
    true
  )
  t.is(
    typeof reports1[0].scriptParseCompile === 'number' &&
      reports1[0].scriptParseCompile >= 0,
    true
  )
  t.is(
    typeof reports1[0].scriptEvaluation === 'number' &&
      reports1[0].scriptEvaluation >= 0,
    true
  )
  t.is(
    typeof reports1[0].javaScript === 'number' && reports1[0].javaScript > 0,
    true
  )
  t.is(
    typeof reports1[0].garbageCollection === 'number' &&
      reports1[0].garbageCollection >= 0,
    true
  )
  t.is(typeof reports1[0].other === 'number' && reports1[0].other >= 0, true)
  t.is(typeof reports1[0].total === 'number' && reports1[0].total > 0, true)

  t.is(reports2.length, 1)
  t.is(
    typeof reports2[0].parseHTML === 'number' && reports2[0].parseHTML >= 0,
    true
  )
  t.is(
    typeof reports2[0].styleLayout === 'number' && reports2[0].styleLayout >= 0,
    true
  )
  t.is(
    typeof reports2[0].paintCompositeRender === 'number' &&
      reports2[0].paintCompositeRender >= 0,
    true
  )
  t.is(
    typeof reports2[0].scriptParseCompile === 'number' &&
      reports2[0].scriptParseCompile >= 0,
    true
  )
  t.is(
    typeof reports2[0].scriptEvaluation === 'number' &&
      reports2[0].scriptEvaluation >= 0,
    true
  )
  t.is(
    typeof reports2[0].javaScript === 'number' && reports2[0].javaScript > 0,
    true
  )
  t.is(
    typeof reports2[0].garbageCollection === 'number' &&
      reports2[0].garbageCollection >= 0,
    true
  )
  t.is(typeof reports2[0].other === 'number' && reports2[0].other >= 0, true)
  t.is(typeof reports2[0].total === 'number' && reports2[0].total > 0, true)

  await cleanChromeConfig()
})

test('estimo - should works properly in DIFF MODE', async t => {
  let chromeInfo = await findChromeBinary()

  let lib1 = path.join(__dirname, '__mock__', '19kb.js')
  let lib2 = path.join(__dirname, '__mock__', '7kb.js')

  let reports = await estimo([lib1, lib2], {
    executablePath: chromeInfo.executablePath,
    runs: 2,
    diff: true
  })

  t.is(reports.length, 2)
  t.is(typeof reports[0].diff === 'undefined', true)
  t.is(typeof reports[1].diff === 'object', true)

  t.is(
    typeof reports[0].parseHTML === 'number' && reports[0].parseHTML >= 0,
    true
  )
  t.is(
    typeof reports[0].styleLayout === 'number' && reports[0].styleLayout >= 0,
    true
  )
  t.is(
    typeof reports[0].paintCompositeRender === 'number' &&
      reports[0].paintCompositeRender >= 0,
    true
  )
  t.is(
    typeof reports[0].scriptParseCompile === 'number' &&
      reports[0].scriptParseCompile >= 0,
    true
  )
  t.is(
    typeof reports[0].scriptEvaluation === 'number' &&
      reports[0].scriptEvaluation >= 0,
    true
  )
  t.is(
    typeof reports[0].javaScript === 'number' && reports[0].javaScript > 0,
    true
  )
  t.is(
    typeof reports[0].garbageCollection === 'number' &&
      reports[0].garbageCollection >= 0,
    true
  )
  t.is(typeof reports[0].other === 'number' && reports[0].other >= 0, true)
  t.is(typeof reports[0].total === 'number' && reports[0].total > 0, true)

  t.is(
    typeof reports[1].parseHTML === 'number' && reports[1].parseHTML >= 0,
    true
  )
  t.is(
    typeof reports[1].styleLayout === 'number' && reports[1].styleLayout >= 0,
    true
  )
  t.is(
    typeof reports[1].paintCompositeRender === 'number' &&
      reports[1].paintCompositeRender >= 0,
    true
  )
  t.is(
    typeof reports[1].scriptParseCompile === 'number' &&
      reports[1].scriptParseCompile >= 0,
    true
  )
  t.is(
    typeof reports[1].scriptEvaluation === 'number' &&
      reports[1].scriptEvaluation >= 0,
    true
  )
  t.is(
    typeof reports[1].javaScript === 'number' && reports[1].javaScript > 0,
    true
  )
  t.is(
    typeof reports[1].garbageCollection === 'number' &&
      reports[1].garbageCollection >= 0,
    true
  )
  t.is(typeof reports[1].other === 'number' && reports[1].other >= 0, true)
  t.is(typeof reports[1].total === 'number' && reports[1].total > 0, true)

  t.is(
    typeof reports[1].diff.parseHTML === 'string' &&
      reports[1].diff.parseHTML.length > 0,
    true
  )
  t.is(
    typeof reports[1].diff.styleLayout === 'string' &&
      reports[1].diff.styleLayout.length > 0,
    true
  )
  t.is(
    typeof reports[1].diff.paintCompositeRender === 'string' &&
      reports[1].diff.paintCompositeRender.length > 0,
    true
  )
  t.is(
    typeof reports[1].diff.scriptParseCompile === 'string' &&
      reports[1].diff.scriptParseCompile.length > 0,
    true
  )
  t.is(
    typeof reports[1].diff.scriptEvaluation === 'string' &&
      reports[1].diff.scriptEvaluation.length > 0,
    true
  )
  t.is(
    typeof reports[1].diff.javaScript === 'string' &&
      reports[1].diff.javaScript.length > 0,
    true
  )
  t.is(
    typeof reports[1].diff.garbageCollection === 'string' &&
      reports[1].diff.garbageCollection.length > 0,
    true
  )
  t.is(
    typeof reports[1].diff.other === 'string' &&
      reports[1].diff.other.length > 0,
    true
  )
  t.is(
    typeof reports[1].diff.total === 'string' &&
      reports[1].diff.total.length > 0,
    true
  )

  await cleanChromeConfig()
})
