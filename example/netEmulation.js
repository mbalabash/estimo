const estimo = require('../index')

;

(async () => {
  const report = await estimo(
    'https://cdnjs.cloudflare.com/ajax/libs/react/16.8.6/umd/react.production.min.js',
    {
      emulateNetworkConditions: true,
      offline: false,
      latency: 150,
      downloadThroughput: 1.6,
      uploadThroughput: 0.75,
      connectionType: 'cellular3g',
    },
  )

  console.log(report)
})()
