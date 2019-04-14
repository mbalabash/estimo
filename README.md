## This is a PoC of idea how to estimate time which browser will spent for load/parse/execute javascript library.

## Usage example

```js
const estimo = require('estimo')

;(async () => {
  const report = await estimo(
    'https://cdnjs.cloudflare.com/ajax/libs/react/16.8.6/umd/react.production.min.js'
  )
  console.log(report)
})()
```

## Output example

```json
{
  "start": 0,
  "end": 159.4800000190735,
  "duration": 159.4800000190735,
  "parseHTML": 7.261999999999974,
  "javaScript": 49.96900000000002,
  "javaScriptCompile": 4.120999999999981,
  "styles": 0.8670000000000755,
  "updateLayerTree": 0.757,
  "layout": 1.2450000000000045,
  "paint": 0.05,
  "raster": 0,
  "composite": 1.4089999999999918,
  "extendedInfo": {
    "domContentLoaded": 156.63200002908707,
    "loadTime": 155.53799998760223,
    "firstPaint": 0,
    "javaScript": {}
  },
  "title": "Load",
  "type": "Load"
}
```

## Possible options

You can pass options to [perf-timeline-cli](https://github.com/CondeNast/perf-timeline-cli) as second argument for more special use causes.

```js
const estimo = require('estimo')

;(async () => {
  const report = await estimo(
    'https://cdnjs.cloudflare.com/ajax/libs/react/16.8.6/umd/react.production.min.js',
    ['--set-cpu-throttling-rate', '--rate', '4']
  )
  console.log(report)
})()
```
