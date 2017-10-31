const yaml = require('js-yaml')
const fs = require('fs')

const throwError = (errMsg) => {
  throw new Error(errMsg)
}

const generateSlug = (value) => {
  // 1) convert to lowercase
  // 2) remove dashes and pluses
  // 3) replace spaces with dashes
  // 4) remove everything but alphanumeric characters and dashes
  return value.toLowerCase()
    .replace(/-+/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

const openYamlFile = (pathToFile) => {
  let obj
  try {
    obj = yaml.safeLoad(fs.readFileSync(pathToFile, 'utf8'))
  } catch (e) {
    console.log(e)
    return
  }
  return obj
}

exports.openYamlFile = openYamlFile
exports.generateSlug = generateSlug
exports.throwError = throwError
