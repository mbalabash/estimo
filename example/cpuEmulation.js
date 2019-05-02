const path = require('path')
const estimo = require('../index')

;

(async () => {
  const report = await estimo(
    [
      path.resolve(path.join(__dirname, './lib/2kb.js')),
      path.resolve(path.join(__dirname, './lib/1.4mb.js')),
      'https://cdnjs.cloudflare.com/ajax/libs/react/16.8.6/umd/react.production.min.js',
    ],
    {
      emulateCpuThrottling: true,
      cpuThrottlingRate: 6,
    },
  )

  console.log(report)
})()
