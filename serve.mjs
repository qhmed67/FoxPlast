// Minimal static server for local verification (vite dev exits when its parent
// shell ends in this sandbox; `vite build` output is stable).
import http from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
const ROOT = join(process.cwd(), 'dist')
const TYPES = { '.js':'text/javascript', '.css':'text/css', '.html':'text/html', '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml', '.woff2':'font/woff2', '.json':'application/json', '.webp':'image/webp' }
http.createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0])
  let path = join(ROOT, normalize(url))
  try {
    let body
    try { body = await readFile(path) } catch { body = await readFile(join(ROOT, 'index.html')); path = join(ROOT,'index.html') }
    res.writeHead(200, { 'Content-Type': TYPES[extname(path)] ?? 'application/octet-stream' })
    res.end(body)
  } catch (e) { res.writeHead(500); res.end(String(e)) }
}).listen(5173, '127.0.0.1', () => console.log('serving dist on 5173'))
