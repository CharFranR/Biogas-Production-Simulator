#!/usr/bin/env node
const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

const distDir = path.join(__dirname, '..', 'dist')
const repo = 'https://github.com/CharFranR/Biogas-Production-Simulator.git'

function run(cmd, opts = {}) {
  console.log(`> ${cmd}`)
  execSync(cmd, { stdio: 'inherit', ...opts })
}

// 1. Build
run('npm run build', { cwd: path.join(__dirname, '..') })

// 2. Clean any leftover .git in dist
const dotGit = path.join(distDir, '.git')
if (fs.existsSync(dotGit)) {
  fs.rmSync(dotGit, { recursive: true, force: true })
}

// 3. Init, commit, and force push
run('git init', { cwd: distDir })
run('git checkout -b gh-pages', { cwd: distDir })
run('git add -A', { cwd: distDir })

const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19)
run(`git commit -m "Deploy ${timestamp}"`, { cwd: distDir })
run(`git remote add origin ${repo}`, { cwd: distDir })
run('git push -f origin gh-pages', { cwd: distDir })

// 4. Clean up .git in dist
fs.rmSync(dotGit, { recursive: true, force: true })

console.log('\n✅ Deploy complete!')
