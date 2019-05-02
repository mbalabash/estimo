function median(array) {
  const sortedArray = array.sort((a, b) => a - b)
  const { length } = sortedArray
  const mid = parseInt(length / 2, 10)
  if (length % 2) {
    return sortedArray[mid]
  }
  const low = mid - 1
  const hight = mid
  return ((parseFloat(sortedArray[low]) + parseFloat(sortedArray[hight])) / 2).toFixed(2)
}

function calcStats(results) {
  const sorted = results.sort((a, b) => a - b)
  const min = sorted[0]
  const mid = +median(sorted)
  const max = sorted[sorted.length - 1]
  const discrepancyToMin = ~~((mid / min) * 100 - 100)
  const discrepancyToMax = ~~(100 - (mid / max) * 100)
  const discrepancy = `${
    discrepancyToMin < discrepancyToMax
      ? `${discrepancyToMin}-${discrepancyToMax}%`
      : `${discrepancyToMax}-${discrepancyToMin}%`
  }`

  return {
    min,
    mid,
    max,
    discrepancy,
  }
}

module.exports = { median, calcStats }
