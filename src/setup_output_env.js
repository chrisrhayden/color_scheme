const fs = require('fs')
const childProses = require('child_process')
const path = require('path')

const makeEnv = (base) => {
  const outPutDir = path.resolve(base, 'output_files')
  if (!fs.existsSync(outPutDir)) {
    fs.mkdirSync(outPutDir, (error, folder) => console.log(error))
  }

  childProses.execSync(`rm -rf ${outPutDir}/*`)
  return outPutDir
}

exports.makeEnv = makeEnv
