import { join } from 'path'
import { runningOnDocker } from './config'
import fs from 'fs-extra'

let basePath = __dirname
if (runningOnDocker) {
    basePath = '/data'
}

// Use JSON file for storage
const file = join(basePath, 'db.json')



type JSONDATA = string | boolean | null | JSONMAP

interface JSONMAP {
    [key: string]: JSONDATA
}

class JsonDB {
    data: JSONDATA = {}
    file: string
    constructor(file) {
        this.file = file
    }

    async read() {
        this.data = JSON.parse((await fs.readFile(file)).toString())
    }

    async write() {
        await fs.writeFile(file, JSON.stringify(this.data))
    }
}

const db = new JsonDB(file)

export default db