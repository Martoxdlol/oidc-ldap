import AsyncNedb from 'nedb-async'
import { runningOnDocker } from './config';
import path from 'path'
import fs from 'fs'

type JSONDATA = string | boolean | null | JSONMAP | JSONDATA[]

interface JSONMAP {
    [key: string]: JSONDATA
}

// class JsonDB {
//     data: JSONMAP
//     file: string
//     constructor(file) {
//         this.file = file
//         this.data = {}
//     }

//     async read() {
//         try {
//             const exist = await fs.pathExists(this.file)
//             if (exist) this.data = JSON.parse((await fs.readFile(this.file)).toString()) || {}
//             if(typeof this.data !== 'object') this.data = {}
//         } catch (error) {
//             console.error("Error reading database: ", error)
//         }
//     }

//     async write() {
//         try {
//             await fs.writeFile(this.file, JSON.stringify(this.data))
//         } catch (error) {
//             console.error("Error writing databse", error)
//             throw error
//         }
//     }
// }

// const db = new JsonDB(file)



let basePath = path.resolve('./data')
if (runningOnDocker) {
    basePath = '/data'
}

if (!fs.existsSync(basePath)){
    fs.mkdirSync(basePath, { recursive: true });
}

const keysDB = new AsyncNedb({ filename: path.join(basePath, 'keys.json') });
const clientsDB = new AsyncNedb({ filename: path.join(basePath, 'clients.json') });
const adapterDB = new AsyncNedb({ filename: path.join(basePath, 'adapter.json') });

async function initDb() {
    await keysDB.asyncLoadDatabase()
    await clientsDB.asyncLoadDatabase()
    await adapterDB.asyncLoadDatabase()
}

export { initDb, keysDB, clientsDB, adapterDB }