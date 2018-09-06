function randomInteger (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}

exports.randomInteger = randomInteger

exports.randomArray = (min, max, map) => {
  return Array.from(Array(randomInteger(min, max)).fill(0), map)
}
