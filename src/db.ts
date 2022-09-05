import { join } from 'path'
import { runningOnDocker } from './config'
import fs from 'fs-extra'

let basePath = __dirname
if (runningOnDocker) {
    basePath = '/data'
}

// Use JSON file for storage
const file = join(basePath, 'data.json')



type JSONDATA = string | boolean | null | JSONMAP | JSONDATA[]

interface JSONMAP {
    [key: string]: JSONDATA
}

class JsonDB {
    data: JSONMAP
    file: string
    constructor(file) {
        this.file = file
        this.data = {}
    }

    async read() {
        try {
            const exist = await fs.pathExists(this.file)
            if (exist) this.data = JSON.parse((await fs.readFile(this.file)).toString()) || {}
            if(typeof this.data !== 'object') this.data = {}
        } catch (error) {
            console.error("Error reading database: ", error)
        }
    }

    async write() {
        try {
            await fs.writeFile(this.file, JSON.stringify(this.data))
        } catch (error) {
            console.error("Error writing databse", error)
            throw error
        }
    }
}

const db = new JsonDB(file)
export default db