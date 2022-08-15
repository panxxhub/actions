import * as core from '@actions/core'
import {exec} from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import * as fse from 'fs-extra'

async function run(): Promise<void> {
  try {
    // const distro: string = core.getInput('distro') ?? 'humble'
    const distro = 'humble'

    const github_path: string = process.env.GITHUB_PATH ?? ''
    const workspace: string = process.env.GITHUB_WORKSPACE ?? ''
    // iterate over all directories in the workspace/src
    const dirs: string[] = fs.readdirSync(path.join(workspace, 'src'))

    for (const dir of dirs) {
      // if the directory contains a package.xml file
      if (fs.existsSync(path.join(workspace, 'src', dir, 'package.xml'))) {
        const pkg_name: string = dir
        core.debug(`Found package.xml for ${pkg_name}`)

        // create a branch called ros2/humble
        const branch = `ros2/${distro}/${pkg_name}`
        core.debug(`branch name: ${branch}`)

        // create a directory for the package(/tmp/${branch}), and copy the files in dir to the directory
        const pkg_dir: string = path.join('/tmp', branch)
        fs.mkdirSync(pkg_dir, {recursive: true})

        // copy git files to the directory
        const pkg_dir_git: string = path.join(pkg_dir, '.git')
        fse.copySync(path.join(workspace, '.git'), pkg_dir_git)

        // copy all files in dir to the directory
        fse.copySync(path.join(workspace, 'src', dir), pkg_dir)

        process.chdir(pkg_dir)

        // create a new branch
        exec(`git checkout -b ${branch}`)

        // commit the changes
        exec(`git add . && git commit -m "${pkg_name} to ${distro}"`)
        // push the changes to the remote, if no remote exists, create one
        exec(`git push -u origin ${branch}`)
      }
    }

    core.debug(`GITHUB_PATH: ${github_path}`)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
