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
    '-y'
  ])
  await exec('mkdir', ['-p', '/tmp/opencv'])
  await exec('mkdir', ['-p', '/tmp/opencv_contrib'])

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
  await exec('unzip', ['opencv.zip', '-d', '/tmp/opencv'])
  await exec('unzip', ['opencv_contrib.zip', '-d', '/tmp/opencv_contrib'])
  info(`Configuring in opencv`)
  const buildDir = join('/tmp/opencv', 'build')
  await mkdirP(buildDir)
  await exec('cmake', [
    `-S/tmp/opencv`,
    `-B/tmp/opencv/build`,
    '-DOPENCV_EXTRA_MODULES_PATH=/tmp/opencv_contrib',
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
  await exec(`cmake --build /tmp/opencv/build --config Release`)

  await exec('ninja install', [], {cwd: '/tmp/opencv/build'})
}

async function run(): Promise<void> {
  const version: string = getInput('opencv-version', {required: true})
  info(`opencv version: ${version}`)
  install_opencv(version)
}
run()
