/**
 * Build the site and package everything for a Host Africa upload.
 *
 * Produces in deploy-hostafrica/:
 *   public_html-upload.zip  → extract into domains/sttheresakalimoniparish.org/public_html
 *   parish-api-upload.zip   → extract into /home/stthere2/parish-api, then RESTART the Node app
 *
 * It also compares the API files and Supabase migrations with the previous
 * pack, so you know whether the Node app needs re-uploading / NPM install
 * and whether any SQL must be run.
 *
 * Usage: pnpm deploy:pack
 */
import { execSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { crc32, deflateRawSync } from 'node:zlib'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT = join(ROOT, 'deploy-hostafrica')
const STATE_FILE = join(OUT, 'last-pack.json')
const API_DIR = join(ROOT, 'parish-api')
const MIGRATIONS_DIR = join(ROOT, 'supabase', 'migrations')
const API_FILES = ['server.js', 'mediaApi.js', 'mediaSlots.js', 'inboxApi.js', 'mpesaApi.js', 'parishEnv.js', 'package.json']

type PackState = { packedAt: string; api: Record<string, string>; migrations: string[] }

function run(label: string, cmd: string) {
  console.log(`\n▶ ${label}`)
  execSync(cmd, { cwd: ROOT, stdio: 'inherit' })
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
}

/** Minimal zip writer — forward-slash paths so cPanel/DirectAdmin extract folders correctly. */
function writeZip(out: string, entries: { name: string; path: string }[]) {
  const locals: Buffer[] = []
  const centrals: Buffer[] = []
  let offset = 0
  const now = new Date()
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)
  const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()

  for (const { name, path } of entries) {
    const data = readFileSync(path)
    const packed = deflateRawSync(data, { level: 9 })
    const nameBuf = Buffer.from(name, 'utf8')
    const crc = crc32(data)

    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt16LE(0x0800, 6) // UTF-8 names
    local.writeUInt16LE(8, 8) // deflate
    local.writeUInt16LE(dosTime, 10)
    local.writeUInt16LE(dosDate, 12)
    local.writeUInt32LE(crc, 14)
    local.writeUInt32LE(packed.length, 18)
    local.writeUInt32LE(data.length, 22)
    local.writeUInt16LE(nameBuf.length, 26)
    locals.push(local, nameBuf, packed)

    const central = Buffer.alloc(46)
    central.writeUInt32LE(0x02014b50, 0)
    central.writeUInt16LE(20, 4)
    central.writeUInt16LE(20, 6)
    central.writeUInt16LE(0x0800, 8)
    central.writeUInt16LE(8, 10)
    central.writeUInt16LE(dosTime, 12)
    central.writeUInt16LE(dosDate, 14)
    central.writeUInt32LE(crc, 16)
    central.writeUInt32LE(packed.length, 20)
    central.writeUInt32LE(data.length, 24)
    central.writeUInt16LE(nameBuf.length, 28)
    central.writeUInt32LE(offset, 42)
    centrals.push(central, nameBuf)

    offset += local.length + nameBuf.length + packed.length
  }

  const centralSize = centrals.reduce((n, b) => n + b.length, 0)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(entries.length, 8)
  end.writeUInt16LE(entries.length, 10)
  end.writeUInt32LE(centralSize, 12)
  end.writeUInt32LE(offset, 16)
  writeFileSync(out, Buffer.concat([...locals, ...centrals, end]))
}

const sha = (p: string) => createHash('sha256').update(readFileSync(p)).digest('hex')

// 1. Check + build
run('Type-checking', 'pnpm exec tsc --noEmit -p .')
run('Building site (uses .env.production)', 'pnpm exec vite build')
if (!existsSync(join(ROOT, 'dist', '.htaccess'))) {
  throw new Error('dist/.htaccess is missing — keep public/.htaccess so deep links work on Apache.')
}

// 2. Zip
mkdirSync(OUT, { recursive: true })
for (const f of ['public_html-upload.zip', 'parish-api-upload.zip']) rmSync(join(OUT, f), { force: true })

const distDir = join(ROOT, 'dist')
const siteEntries = walk(distDir).map((p) => ({ name: relative(distDir, p).split(sep).join('/'), path: p }))
writeZip(join(OUT, 'public_html-upload.zip'), siteEntries)
writeZip(
  join(OUT, 'parish-api-upload.zip'),
  API_FILES.map((name) => ({ name, path: join(API_DIR, name) })),
)

// 3. Compare with previous pack
const prev: PackState | null = existsSync(STATE_FILE) ? JSON.parse(readFileSync(STATE_FILE, 'utf8')) : null
const api = Object.fromEntries(API_FILES.map((f) => [f, sha(join(API_DIR, f))]))
const migrations = readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort()
const changedApi = prev ? API_FILES.filter((f) => prev.api[f] !== api[f]) : API_FILES
const newMigrations = prev ? migrations.filter((m) => !prev.migrations.includes(m)) : []
writeFileSync(STATE_FILE, JSON.stringify({ packedAt: new Date().toISOString(), api, migrations }, null, 2))

// 4. Checklist
const line = '─'.repeat(64)
console.log(`\n${line}\n✅ Ready to upload — files in deploy-hostafrica/\n${line}`)
console.log(prev ? `Compared with previous pack (${prev.packedAt}).` : 'First pack — no previous record to compare with.')

console.log('\n1) WEBSITE  →  domains/sttheresakalimoniparish.org/public_html')
console.log('   • Delete the old  assets/  folder and  index.html   (leave the  api  folder alone)')
console.log('   • Upload public_html-upload.zip → Extract → overwrite → delete the zip')

console.log('\n2) API  →  /home/stthere2/parish-api')
if (changedApi.length === 0) {
  console.log('   • No API changes — skip.')
} else {
  console.log(`   • Changed: ${changedApi.join(', ')}`)
  console.log('   • Upload parish-api-upload.zip → Extract → overwrite (keep node_modules / .env)')
  if (changedApi.includes('package.json')) console.log('   • package.json changed → click "Run NPM Install"')
  console.log('   • Node.js → edit app → RESTART')
}

console.log('\n3) DATABASE (Supabase SQL Editor)')
if (newMigrations.length) newMigrations.forEach((m) => console.log(`   • Run supabase/migrations/${m}`))
else console.log('   • No new migrations — skip.')

console.log('\n4) CHECK')
console.log('   • https://api.sttheresakalimoniparish.org/api/health')
console.log('   • https://sttheresakalimoniparish.org  (Ctrl+F5 to bypass cache)')
console.log(line)
