import path from 'path'
import { fileURLToPath } from 'url'
import estimo from '../../index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const localJsFile = path.join(__dirname, '19kb.js')

;(async () => {
  // const reports = await estimo(['https://news.ycombinator.com/news', 'https://www.google.com/'], {runs: 7})
  // const reports = await estimo([localJsFile,'https://github.githubassets.com/assets/compat-bootstrap-6e7ff7ac.js'], {runs: 6})
  const reports = await estimo([localJsFile,'https://github.githubassets.com/assets/compat-bootstrap-6e7ff7ac.js'], {runs: 4, diff: true})
  console.log(reports)
})()
