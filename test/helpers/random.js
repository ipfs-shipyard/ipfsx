const shortid = require('shortid')
const { randomBytes } = require('crypto')

function randomInteger (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}

exports.randomInteger = randomInteger

function randomArray (min, max, map) {
  return Array.from(Array(randomInteger(min, max)).fill(0), map)
}

exports.randomArray = randomArray

function randomDirectory (options) {
  options = options || {}
  options.depth = options.depth || randomInteger(0, 5)
  options.maxDirs = options.maxDirs || randomInteger(0, 10)
  options.maxFiles = options.maxFiles || randomInteger(0, 50)
  options.createContent = options.createContent || (() => randomBytes(randomInteger(1, 64)))

  if (options.depth === 0) {
    const filePath = `file-${shortid()}`
    return [{ path: filePath, content: options.createContent(filePath) }]
  }

  function createDir (path) {
    const list = randomArray(0, options.maxFiles, () => {
      const filePath = path ? `${path}/file-${shortid()}` : `file-${shortid()}`
      return { path: filePath, content: options.createContent(filePath) }
    })

    if (path.split('/').length >= options.depth) {
      return list
    }

    const dirNames = randomArray(0, options.maxDirs, shortid)

    return list.concat(
      dirNames.reduce((dirList, dirName) => {
        const dirPath = path ? `${path}/dir-${dirName}` : `dir-${dirName}`
        return dirList.concat(createDir(dirPath))
      }, [])
    )
  }

  return createDir(`root-${shortid()}`)
}

exports.randomDirectory = randomDirectory
