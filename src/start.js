/* all functions are called in start
 * sould probibly break most off and add to env file */
const fs = require('fs')
const path = require('path')
const env = require('./setup_output_env')
const builder = require('./builder')
const utils = require('./utils')

// bare minimum for cli arg processing
const cliArgs = () => {
  if (process.argv[2]) {
    const colorName = process.argv[2].replace('/', '')

    return colorName
  } else {
    throw new Error('no color folder given')
  }
}

/** FIXME: still jankey
 * loop over templates directory
 * adding config and template files to obj */
const getTemplates = (base) => {
  if (fs.existsSync(path.resolve(base, 'default.mustache'))) {
    return {
      templatesArray: [path.resolve(base, 'default.mustache')],
      config: path.resolve(base, 'config.yaml')
    }
  } else if (fs.existsSync(path.resolve(base, 'templates'))) {
    const templatesDir = path.resolve(base, 'templates')

    let templates2Obj = {}
    const templatesArray = fs.readdirSync(templatesDir)

    /* loop over templatesArray adding every folder path
     * in base/templates to templates2Obj */
    templatesArray.forEach((templatesName) => {
      templates2Obj[`${templatesName}`] = path
        .resolve(templatesDir, templatesName, 'templates')
    })

    console.log(templates2Obj)
    return templates2Obj
  }
}

// if prohect folder is not as expected trow error
const getSchemes = (schemeName) => {
  const cwd = process.cwd()
  const base = path.resolve(cwd, schemeName)
  let schemeFile

  // check the root source dir
  if (!fs.existsSync(base)) {
    utils.throwError(`error: no source called ${base}`)
  }

  /* the following will give a path to the scheme file,
   * whether its named or just called color.yaml */

  // if a yaml file call the name given on the cli
  if (fs.existsSync(path.resolve(base, 'schemes', `${schemeName}.yaml`))) {
    schemeFile = path.resolve(base, 'schemes', `${schemeName}.yaml`)
    console.log(`makeing scheme ${schemeName}`)
  } else {
    utils.throwError(`error: no ${schemeName} or color .yaml file`)
  }

  // return the file object
  return {
    base,
    schemeName,
    schemeFile
  }
}

/** makes a file object containing:
 * @base, the folder given on command line
 * @colorName: the file/color scheme name
 * @templatesObj: the template path and config path in an obj
 * @schemeFile: the file path to the color scheme
 * @destination: the output folder
 * and sends to buildRunner */
const start = () => {
  // get the colorScheme from cli args
  const colorScheme = cliArgs()
  // looks if project dirs and files exists, return an obj
  const filesObj = getSchemes(colorScheme)
  const base = filesObj.base

  /* get an obj of templates,
   * template: path template, config: path */
  const templatesObj = getTemplates(base)
  // makeEnv makes and/or clears the necessary dirs
  const outputDestination = env.makeEnv(base)

  // add destination and templatesObj to the obj
  filesObj.destination = outputDestination
  filesObj.templatesObj = templatesObj

  // send filesObj to builder
  builder.buildRunner(filesObj)
}

start()
