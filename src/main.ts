import {info, getInput} from '@actions/core'
import {exec} from '@actions/exec'
import {mkdirP} from '@actions/io'
import {join} from 'path'

async function install_grpc(version: string): Promise<void> {
  info('cloning grpc repo...')
  await exec('git', [
    'clone',
    '--depth',
    '1',
    '--recurse-submodules',
    '--shallow-submodules',
    '-b',
    version,
    'https://github.com/grpc/grpc'
  ])
  const extPath = 'grpc'
  info(`Configuring in ${extPath}`)
  const buildDir = join(extPath, 'build')
  await mkdirP(buildDir)
  await exec(
    'cmake',
    [
      '-DgRPC_INSTALL=ON',
      '-DgRPC_SSL_PROVIDER=package',
      '-DgRPC_BUILD_TESTS=OFF',
      '-DgRPC_BUILD_GRPC_PYTHON_PLUGIN=OFF',
      '-DgRPC_BUILD_GRPC_CSHARP_PLUGIN=OFF',
      '-DgRPC_BUILD_GRPC_NODE_PLUGIN=OFF',
      '-DgRPC_BUILD_GRPC_OBJECTIVE_C_PLUGIN=OFF',
      '-DgRPC_BUILD_GRPC_PHP_PLUGIN=OFF',
      '-DgRPC_BUILD_GRPC_RUBY_PLUGIN=OFF',
      '-DgRPC_BUILD_CSHARP_EXT=OFF',
      '-DgRPC_BUILD_TESTS=OFF',
      '-DgRPC_BUILD_CODEGEN=OFF',
      '-DgRPC_BACKWARDS_COMPATIBILITY_MODE=ON',
      '..'
    ],
    {cwd: buildDir}
  )
  info(`Compiling in ${buildDir}`)
  await exec('make', ['-j'], {cwd: buildDir})

  await exec('make install', [], {cwd: buildDir})
}

async function run(): Promise<void> {
  const version: string = getInput('grpc-version', {required: true})
  info(`grpc version: ${version}`)
  install_grpc(version)
}
run()
