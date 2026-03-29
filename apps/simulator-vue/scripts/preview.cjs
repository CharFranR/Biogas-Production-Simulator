#!/usr/bin/env node
const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = process.env.PORT || 5173
const PUBLIC_ROOT = path.join(__dirname, '..', 'preview_root')
const DIST_SRC = path.join(__dirname, '..', 'dist')
const SUBPATH = '/Biogas-Production-Simulator'

async function copyDir(src, dest) {
  await fs.promises.mkdir(dest, { recursive: true })
  const entries = await fs.promises.readdir(src, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) await copyDir(srcPath, destPath)
    else await fs.promises.copyFile(srcPath, destPath)
  }
}

async function prepare() {
  const target = path.join(PUBLIC_ROOT, SUBPATH.replace(/^\//, ''))
  try { await fs.promises.rm(PUBLIC_ROOT, { recursive: true, force: true }) } catch(e) {}
  await copyDir(DIST_SRC, target)
  return target
}

function contentTypeByExt(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  return {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.woff2': 'font/woff2',
  }[ext] || 'application/octet-stream'
}

function startServer(root) {
  const server = http.createServer((req, res) => {
    let url = req.url || '/'
    if (!url.startsWith(SUBPATH)) {
      res.writeHead(302, { Location: SUBPATH + (url === '/' ? '/' : url) })
      return res.end()
    }
    let rel = url.slice(SUBPATH.length)
    if (!rel || rel === '/') rel = '/index.html'
    const filePath = path.join(root, rel)
    fs.promises.stat(filePath).then(stat => {
      if (stat.isDirectory()) {
        const index = path.join(filePath, 'index.html')
        return fs.promises.readFile(index)
      }
      return fs.promises.readFile(filePath)
    }).then(content => {
      res.writeHead(200, { 'Content-Type': contentTypeByExt(filePath) })
      res.end(content)
    }).catch(() => {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end('Not found')
    })
  })

  server.listen(PORT, () => {
    console.log(`Preview available at http://localhost:${PORT}${SUBPATH}/`)
  })
}

prepare().then(root => startServer(root)).catch(err => {
  console.error('Error preparing preview:', err)
  process.exit(1)
})
