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

## CLI

```sh
estimo -l ./libs/someLib.js
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

## Fields Description

- **start** - Event start time.

- **end** - Event end time.

- **duration** - Event duration.

- **parseHtml** - Time for executing HTML parsing algorithm.

- **javaScript** - Time which was spent for `FunctionCall`, `EvaluateScript`, `V8.Execute`, `MajorGC`, `MinorGC`, `GCEvent` events.

- **javaScriptCompile** - Time which was spent for `v8.compile` event.

- **styles** - Time which was spent for `UpdateLayoutTree`, `RecalculateStyles`, `ParseAuthorStyleSheet` events.

- **updateLayerTree** - Time which was spent for `UpdateLayerTree` event.

- **layout** - Time which was spent for `Layout` event.

- **paint** - Time which was spent for `Paint` event.

- **raster** - Time which was spent for `RasterTask`, `Rasterize` events.

- **composite** - Time which was spent for `CompositeLayers` event.

- **extendedInfo.domContentLoaded** - Time, when `MarkDOMContent` was fired.

- **extendedInfo.loadTime** - Time, when `MarkLoad` was fired.

- **extendedInfo.firstPaint** - Time, when `MarkFirstPaint` was fired.

- **extendedInfo.javaScript** - This object holds time which was spent for `FunctionCall`, `EvaluateScript`, `V8.Execute`, `MajorGC`, `MinorGC`, `GCEvent` for concrete remote script.

- **title** - Event title.

- **type** - Event type. One of three: `Load`, `Animation`, `Response` ([see more](https://github.com/googlearchive/big-rig/tree/master/app#projects-and-actions)).

## CPU Throttling Rate Options

According to [perf-timeline-cli](https://github.com/CondeNast/perf-timeline-cli) documentation.

The CPU Throttling Rate Emulation Options allow you to generate a Performance timeline under specified CPU conditions. To turn on CPU emulation, you must pass the `--set-cpu-throttling-rate` flag along with additional configuration options.

- `--set-cpu-throttling-rate` (optional; `false`) - This flag allows the other CPU Throttling Rate Options to be respected. They will be completely ignored unless this flag is set.

- `--rate` (optional; `1`) - Sets the CPU throttling rate. The number represents the slowdown factor (e.g., 2 is a "2x" slowdown).

**JS API Example**:

```js
...
await estimo('/absolute/path/to/lib', [
  '--set-cpu-throttling-rate',
  '--rate',
  '4',
])
...
```

**CLI Example**:

```sh
estimo -l ./libs/angular.1.7.8.min.js --perfCliArgs="--set-cpu-throttling-rate --rate 4"
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

**JS API Example**:

```js
...
await estimo('/absolute/path/to/lib', [
  '--emulate-network-conditions',
  '--latency',
  '150',
  '--upload-throughput',
  '0.75',
  '--download--throughput',
  '1.6',
])
...
```

**CLI Example**:

```sh
estimo -l ./libs/angular.1.7.8.min.js --perfCliArgs="--emulate-network-conditions --latency 150 --upload-throughput 0.75 --download--throughput 1.6"
```

**[More examples](https://github.com/mbalabash/estimo-examples)**
