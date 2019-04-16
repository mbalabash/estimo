## Install

```js
npm i estimo
```

or

```js
yarn add estimo
```

## JS API

```js
const estimo = require('estimo')
const path = require('path')

;(async () => {
  const report = await estimo(
    path.resolve(path.join(__dirname, '..', 'libs', 'someLib.js'))
  )
  console.log(report)
})()
```

## Cli

```sh
estimo -l ./libs/angular.1.7.8.min.js
```

```sh
estimo -l ./libs/angular.1.7.8.min.js --perfCliArgs="--set-cpu-throttling-rate --rate 4"
```

## Output Example

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

## Network Emulation Options

According to [perf-timeline-cli](https://github.com/CondeNast/perf-timeline-cli) documentation.

The Network Emulation Options allow you to generate a Performance timeline under specified network conditions. To turn on network emulation, you must pass the `--emulate-network-conditions` flag along with additional configuration options.

- `--emulate-network-conditions` (optional; `false`) - This flag allows the other Network Emulation Options to be respected. They will be completely ignored unless this flag is set.

- `--offline` (optional; `false`) - Passing the `--offline` flag to the generate command emulate a network disconnect.

- `--latency` (optional; `0`) - Artificial, minimum latency between request sent and response header received expressed in milliseconds (ms).

- `--download-throughput` (optional: `-1`) - The maximum download speed in megabits per second. Note Chrome Headless' version of this argument uses bytes per second. Perf Timeline CLI uses megabits per second as that is a more common measure of network throughput. `-1` disables throttling.

- `--upload-throughput` (optional: `-1`) - The maximum upload speed in megabits per second. Note Chrome Headless' version of this argument uses bytes per second. Perf Timeline CLI uses megabits per second as that is a more common measure of network throughput.`-1` disables throttling.

- `--connection-type` (optional: `none`) - A label of the supposed underlying network connection type that the browser is using. Supported values are documented under Chrome Headless' ConnectType documentation.

## CPU Throttling Rate Options

According to [perf-timeline-cli](https://github.com/CondeNast/perf-timeline-cli) documentation.

The CPU Throttling Rate Emulation Options allow you to generate a Performance timeline under specified CPU conditions. To turn on CPU emulation, you must pass the `--set-cpu-throttling-rate` flag along with additional configuration options.

- `--set-cpu-throttling-rate` (optional; `false`) - This flag allows the other CPU Throttling Rate Options to be respected. They will be completely ignored unless this flag is set.

- `--rate` (optional; `1`) - Sets the CPU throttling rate. The number represents the slowdown factor (e.g., 2 is a "2x" slowdown).

**[More examples](https://github.com/mbalabash/estimo-examples)**
