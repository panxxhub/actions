import {info, getInput} from '@actions/core'
import {exec} from '@actions/exec'
import {mkdirP} from '@actions/io'
import {join} from 'path'

async function install_opencv(version: string): Promise<void> {
  info('cloning grpc repo...')
  await exec('apt-get', ['install', 'build-essential', 'ninja-build', 'cmake'])
  await exec('wget', [
    '-O',
    'opencv.zip',
    `https://github.com/opencv/opencv/archive/${version}.zip`
  ])
  await exec('wget', [
    '-O',
    'opencv_contrib.zip',
    // 'https://github.com/opencv/opencv_contrib/archive/4.x.zip'
    `https://github.com/opencv/opencv_contrib/archive/${version}.zip`
  ])
  // RUN unzip opencv.zip && unzip opencv_contrib.zip
  await exec('unzip', ['opencv.zip'])
  await exec('unzip', ['opencv_contrib.zip'])
  const extPath = 'opencv'
  info(`Configuring in ${extPath}`)
  const buildDir = join(extPath, 'build')
  await mkdirP(buildDir)
  await exec('cmake', [
    `-S${extPath}`,
    `-B${buildDir}`,
    '-DOPENCV_EXTRA_MODULES_PATH=opencv_contrib',
    '-DBUILD_DOCS:BOOL=OFF',
    '-DBUILD_EXAMPLES:BOOL=OFF',
    '-DBUILD_NEW_PYTHON_SUPPORT:BOOL=OFF',
    '-DBUILD_PACKAGE:BOOL=OFF',
    '-DBUILD_SHARED_LIBS:BOOL=ON',
    '-DBUILD_TESTS:BOOL=OFF',
    '-DCMAKE_BUILD_TYPE:STRING=Release',
    '-DOPENCV_ENABLE_NONFREE:BOOL=OFF',
    '-DWITH_FFMPEG:BOOL=OFF',
    '-DBUILD_LIST:STRING=core,imgproc,imgcodecs,features2d,xfeatures2d',
    '-GNinja'
  ])
  info(`Compiling in ${buildDir}`)
  await exec(`cmake --build ${buildDir}`)

  await exec('ninja install', [], {cwd: buildDir})
}

async function run(): Promise<void> {
  const version: string = getInput('opencv-version', {required: true})
  info(`opencv version: ${version}`)
  install_opencv(version)
}
run()
