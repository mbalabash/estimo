const path = require('path')
const estimo = require('../../index')

console.log(__dirname)

const localJsFile = path.join(__dirname, '19kb.js')

;(async () => {
  // const reports = await estimo(['https://news.ycombinator.com/news', 'https://www.google.com/'], {runs: 13})
  const reports = await estimo([localJsFile, 'https://github.githubassets.com/assets/compat-bootstrap-6e7ff7ac.js'], {runs: 13})
  console.log(reports)
})()
// ESTIMO_DEBUG=true 