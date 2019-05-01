const median = (array) => {
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

module.exports = { median }
