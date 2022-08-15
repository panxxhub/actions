import * as core from '@actions/core'
import {exec} from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import * as fse from 'fs-extra'

async function run(): Promise<void> {
  try {
    const distro: string = core.getInput('distro') ?? 'humble'
    // pwd
    const workspace: string = process.env.GITHUB_WORKSPACE ?? process.cwd()
    core.debug(`workspace: ${workspace}`)
    // iterate over all directories in the workspace/src
    const dirs: string[] = fs.readdirSync(path.join(workspace, 'src'))

    process.chdir(workspace)
    exec(
      "git branch -r | grep 'origin' | grep -v 'main$' | grep -v HEAD | cut -d/ -f2- | while read line; do git push origin :heads/$line; done;"
    )

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

        // create a directory for the package(/tmp/${branch}), and copy the files in dir to the directory

        const pkg_dir: string = path.join('/tmp', branch)
        core.debug(`package directory: ${pkg_dir}`)
        // if proj_dir exists, delete it
        if (fs.existsSync(pkg_dir)) {
          fse.removeSync(pkg_dir)
        }

        fs.mkdirSync(pkg_dir, {recursive: true})

        // copy git files to the directory
        const pkg_dir_git: string = path.join(pkg_dir, '.git')
        const ws_git: string = path.join(workspace, '.git')
        fse.copySync(ws_git, pkg_dir_git)

        process.chdir(pkg_dir)
        core.debug(`changed directory to ${pkg_dir}`)
        exec(`git checkout -b ${branch}`)

        // copy all files in dir to the directory
        core.debug(`package source directory: ${pkg_src_dir}`)
        fse.copySync(pkg_src_dir, pkg_dir)

        // create a new branch
        // commit the changes
        exec(`git add . && git commit -m "${pkg_name} to ${distro}"`)
        // push the changes to the remote, if no remote exists, create one
        exec(`git push -u ${branch}`)
      }
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
