import {info, getInput} from '@actions/core'
import {exec} from '@actions/exec'
import {mkdirP} from '@actions/io'
import {join} from 'path'

async function install_opencv(version: string): Promise<void> {
  info('installing build deps...')
  await exec('sudo', [
    'apt-get',
    'install',
    'build-essential',
    'ninja-build',
    'cmake',
    'unzip',
    '-y'
  ])

  await exec('wget', [
    '-O',
    '/tmp/opencv.zip',
    `https://github.com/opencv/opencv/archive/${version}.zip`,
    '-q'
  ])
  await exec('wget', [
    '-O',
    '/tmp/opencv_contrib.zip',
    `https://github.com/opencv/opencv_contrib/archive/${version}.zip`,
    '-q'
  ])

  // RUN unzip opencv.zip && unzip opencv_contrib.zip
  await exec('unzip', ['/tmp/opencv.zip', '-d', '/tmp'])
  await exec('unzip', ['/tmp/opencv_contrib.zip', '-d', '/tmp'])
  info(`Configuring in opencv`)
  const buildDir = join('/tmp/opencv', 'build')
  await mkdirP(buildDir)
  await exec('cmake', [
    `-S/tmp/opencv-${version}`,
    `-B/tmp/opencv-${version}/build`,
    `-DOPENCV_EXTRA_MODULES_PATH=/tmp/opencv_contrib-${version}/modules`,
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
  info(`Compiling in /tmp/opencv/build`)
  await exec(`cmake --build /tmp/opencv-${version}/build --config Release`)

  await exec('sudo ninja install', [], {cwd: `/tmp/opencv-${version}/build`})
}

async function run(): Promise<void> {
  const version: string = getInput('opencv-version', {required: true})
  info(`opencv version: ${version}`)
  install_opencv('4.6.0')
}
run()
