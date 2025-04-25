import { execSync } from "child_process"

function setupGitConfig() {
  execSync("git config --local core.longpaths true")
  execSync("git config --local core.ignorecase false")
}

setupGitConfig()
