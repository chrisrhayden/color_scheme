const fs = require('fs')
const path = require('path')
const childProcess = require('child_process')
const color = require('color')
const mustache = require('mustache')
const utils = require('./utils')

const sendToMustache = (destinationPath, templatePath, view, colorName) => {
  const configYaml = utils.openYamlFile(path.resolve(templatePath, 'config.yaml'))
  const templateFile = path.resolve(templatePath, 'default.mustache')

  // if ether config file or the color scheme file do not exists trow an error
  if (!fs.existsSync(templateFile)) utils.throwError('no default.mustache file')
  if (!configYaml.default.extension) utils.throwError('no config.yaml file')
  const extension = configYaml.default.extension

  // set a prefix if there are any
  let prefix
  if (configYaml.default.prefix) prefix = configYaml.default.prefix
  else prefix = ''

  if (!fs.existsSync(destinationPath)) {
    fs.mkdirSync(destinationPath)
  }
  childProcess.execSync(`rm  -rf ${destinationPath}/*`)

  const destinationPathPlus = path.resolve(destinationPath, colorName)
  if (!fs.existsSync(destinationPathPlus)) {
    fs.mkdirSync(destinationPathPlus)
  }

  // get the whole file as a str
  const templateFileSir = fs.readFileSync(templateFile, 'utf8')

  // use the mustache library
  const mustacheOutStr = mustache.render(templateFileSir, view)

  // add extension from configFile to whole destination path
  const outputFile = path
    .resolve(destinationPathPlus, prefix + colorName + extension)

  // finally write the rendered mustache file to outputFile
  fs.writeFileSync(outputFile, mustacheOutStr)
  console.log(`wrote file to \n${outputFile}`)
}

const getView = (colorSchemePath, colorName) => {
  const colorsObj = utils.openYamlFile(colorSchemePath)

  // will also bf filled below
  let myView = {
    'scheme-slug': utils.generateSlug(colorName),
    'scheme-author': colorsObj.author,
    'scheme-name': colorsObj.scheme
  }

  const re = /(\d|[A-Z]{6})/

  // myView will be filled by the Object.key.forEach
  Object.keys(colorsObj).forEach((key) => {
    // the str.match() will match any 6 uppercase characters and numbers
    if (!colorsObj[key].match(re)) {
      return
    }
    // building view for color library
    myView[`${key}-hex`] = colorsObj[key].toLowerCase()
    myView[`${key}-hex-r`] = colorsObj[key].slice(0, 1).toLowerCase()
    myView[`${key}-hex-g`] = colorsObj[key].slice(2, 4).toLowerCase()
    myView[`${key}-hex-b`] = colorsObj[key].slice(4, 6).toLowerCase()
    myView[`${key}-rgb-r`] = color(`#${colorsObj[key]}`).red()
    myView[`${key}-rgb-g`] = color(`#${colorsObj[key]}`).green()
    myView[`${key}-rgb-b`] = color(`#${colorsObj[key]}`).blue()
    myView[`${key}-dec-r`] = color(`#${colorsObj[key]}`).red() / 255
    myView[`${key}-dec-g`] = color(`#${colorsObj[key]}`).green() / 255
    myView[`${key}-dec-b`] = color(`#${colorsObj[key]}`).blue() / 255
  })
  console.log(myView)
  return myView
}

/** all build functions are called here
 * buildObj:
 *  base: path given on command line, path
 *  colorName: name of color scheme, str
 *  schemeFile: path for color_scheme.yaml
 *  templatesObj: and object, template: path, template_config: path */
const buildRunner = (buildObj) => {
  const colorName = buildObj.schemeName
  // <---- get paths, str's
  const colorSchemePath = buildObj.schemeFile
  // ----->

  // get an object to give mustache
  const view = getView(colorSchemePath, colorName)

  // loop over template path array, assigning each to templatePath
  console.log(buildObj)
  Object.keys(buildObj.templatesObj).forEach((key) => {
    const destinationPath = path.resolve(buildObj.destination, key)
    const tPath = buildObj.templatesObj[key]
    sendToMustache(destinationPath, tPath, view, colorName)
  })
}

exports.buildRunner = buildRunner
