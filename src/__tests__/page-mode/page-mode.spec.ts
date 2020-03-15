import test from 'ava'
import path from 'path'
import { estimoPageMode } from '../../page-mode'
import { getUrlToHtmlFile } from '../../utils'
import { findChrome } from '../../../scripts/chrome-detection'

test('estimoPageMode - should works properly', async t => {
  const page = getUrlToHtmlFile(path.join(__dirname, '..', '__mock__', 'test.html'))

  const chromePath = await findChrome()

  const reports = await estimoPageMode([page], {
    executablePath: chromePath,
  })

  t.is(reports[0].name, page)
  t.is(typeof reports[0].parseHTML === 'number' && reports[0].parseHTML >= 0, true)
  t.is(typeof reports[0].styleLayout === 'number' && reports[0].styleLayout >= 0, true)
  t.is(
    typeof reports[0].paintCompositeRender === 'number' && reports[0].paintCompositeRender >= 0,
    true
  )
  t.is(
    typeof reports[0].scriptParseCompile === 'number' && reports[0].scriptParseCompile >= 0,
    true
  )
  t.is(typeof reports[0].scriptEvaluation === 'number' && reports[0].scriptEvaluation >= 0, true)
  t.is(typeof reports[0].javaScript === 'number' && reports[0].javaScript > 0, true)
  t.is(typeof reports[0].garbageCollection === 'number' && reports[0].garbageCollection >= 0, true)
  t.is(typeof reports[0].other === 'number' && reports[0].other >= 0, true)
  t.is(typeof reports[0].total === 'number' && reports[0].total > 0, true)
})
