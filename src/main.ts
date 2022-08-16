import * as core from '@actions/core'
import * as fs from 'fs'
import * as path from 'path'
import * as fse from 'fs-extra'
import * as tar from 'tar'

async function run(): Promise<void> {
  try {
    let distro: string = core.getInput('distro') ?? 'humble'
    if (distro.length === 0) {
      distro = 'humble'
    }
    // pwd
    const workspace: string = process.env.GITHUB_WORKSPACE ?? process.cwd()
    core.debug(`workspace: ${workspace}`)
    // iterate over all directories in the workspace/src
    const dirs: string[] = fs.readdirSync(path.join(workspace, 'src'))

    const fileNames: string[] = ['|']

    for (const dir of dirs) {
      // if the directory contains a package.xml file

      const pkg_src_dir: string = path.join(workspace, 'src', dir)
      const pkg_xml_path: string = path.join(pkg_src_dir, 'package.xml')

      core.debug(`Processing ${dir}, package.xml full path: ${pkg_xml_path}`)

      if (fs.existsSync(pkg_xml_path)) {
        const pkg_name: string = dir
        core.debug(`Found package.xml at ${pkg_xml_path}`)

        // create a branch called ros2/humble
        const branch = `ros2/${distro}/${pkg_name}`
        core.debug(`branch name: ${branch}`)
        // mkdir branch

        // create a directory for the package(/tmp/${branch}), and copy the files in dir to the directory

        const pkg_dir: string = path.join('/tmp', branch)
        if (fs.existsSync(pkg_dir)) {
          fse.removeSync(pkg_dir)
        }

        fs.mkdirSync(pkg_dir, {recursive: true})
        core.debug(`pkg dir: ${pkg_dir}`)
        core.debug(`src dir: ${pkg_src_dir}`)
        // if proj_dir exists, delete it
        const file_name = path.join(pkg_dir, `${pkg_name}.tar.gz`)

        tar
          .c({gzip: true, cwd: pkg_src_dir}, ['.'])
          .pipe(fs.createWriteStream(file_name))

        fileNames.push(file_name)
      }
    }
    // convert fileNames to \n separated string, starts with |
    const fileNamesString: string = fileNames.join('\t\n')
    core.debug(`file_names: ${fileNamesString}`)
    core.setOutput('file_names', fileNamesString)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
