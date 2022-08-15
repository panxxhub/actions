import core from '@actions/core'

async function run(): Promise<void> {
  try {
    const github_path: string = process.env.GITHUB_PATH ?? ''

    core.debug(`GITHUB_PATH: ${github_path}`)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
