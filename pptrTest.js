const estimo = require('./index')

;

(async () => {
  const report = await estimo(
    'https://cdnjs.cloudflare.com/ajax/libs/react/16.8.6/umd/react.production.min.js',
  )
  console.log('Report:', report)
})()
