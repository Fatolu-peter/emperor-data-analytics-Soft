import { rm, cp } from 'node:fs/promises'
import path from 'node:path'

const rootDir = path.resolve(import.meta.dir, '..')
const buildDir = path.join(rootDir, 'build')

await rm(buildDir, { recursive: true, force: true })
await cp(path.join(rootDir, 'web/public'), buildDir, { recursive: true })
