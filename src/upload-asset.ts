import * as core from '@actions/core'
import * as github from '@actions/github'

async function run(): Promise<void> {
  try {
    const token: string =
      core.getInput('token') ?? process.env.GITHUB_TOKEN ?? ''
    const gtihub: string = github.getOctokit(token)

    const uploadAssetResponse = await github.repos.uploadAssetResponse({
      url: uploadUrl

    })

    const uploadUrl = core.getInput('upload_url', {required: true})
  } catch (error) {
    core.setFailed(error.message)
  }
}
