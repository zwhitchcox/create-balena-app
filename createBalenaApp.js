const cp = require('child_process')
const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const commander = require('commander')
const packageJson = require('./package.json')
let projectName
function init() {
  const program = new commander.Command(packageJson.name)
    .version(packageJson.version)
    .arguments('<project-directory>')
    .usage(`${chalk.green('<project-directory>')} [options]`)
    .action(name => {
      projectName = name
    })
    .option('--ip <ip-address>', 'live machine ip address')
    .parse(process.argv)

  if (typeof projectName === "undefined") {
    console.error('Please specify the project directory:')
    console.log(
      `  ${chalk.cyan(program.name())} ${chalk.green('<project-directory>')}`
    );
    console.log();
    console.log(
      `  ${chalk.cyan(program.name())} ${chalk.green('my-react-app')}`
    );
    console.log();
    process.exit(1)
  }

  createApp(projectName, program.ip)
}

// TODO: add different front ends (vue, angular, react native)
// TODO: add different back ends (golang, rust, etc.)

function createApp(name, ip) {
  clone(projectName)
    .then(() => install(projectName))
    .then(() => addIP(name, ip))
    .catch(console.error)
}

function clone(name) {
  return new Promise((res, rej) => {
    const createProcess = cp
      .spawn('git', ['clone', 'https://github.com/zwhitchcox/balena-app', name], {
        stdio: 'inherit',
        cwd: process.cwd(),
      })
    createProcess.on('exit', res)
    createProcess.on('error', rej)
  })
}

function install(name) {
  return Promise.all([
    new Promise((res, rej) => {
      const installProcess = cp
        .spawn('npm', ['install'], {
          stdio: 'inherit',
          cwd: path.resolve(process.cwd(), name, 'server')
        })
      installProcess.on('exit', res)
      installProcess.on('error', rej)
    }),
    new Promise((res, rej) => {
      const installProcess = cp
        .spawn('npm', ['install'], {
          stdio: 'inherit',
          cwd: path.resolve(process.cwd(), name, 'client')
        })
      installProcess.on('exit', res)
      installProcess.on('error', rej)
    }),
  ])
}

function addIP(name, ip) {
  if (typeof ip !== "undefined") {
    return fs.writeFile(path.resolve(process.cwd(), name, '.env'), `REACT_APP_LIVE_IP=${ip}`)
  }
  return Promise.resolve()
}


module.exports = {init}