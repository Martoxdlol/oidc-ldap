import db from "./db";
import crypto from 'crypto'
import { pem2jwk } from 'pem-jwk'
import simplePem2jwk from 'simple-pem2jwk'
import { JWK } from 'node-jose'

const randString = (length: number = 48) => crypto.randomBytes(length).toString('hex')

function genCookieKeys() {
    return [
        randString(),
        randString(),
    ]
}

async function asyncGetCookieKeys(): Promise<string[]> {
    try {
        await db.read()
        const red = db.data['cookieKeys'] as string[]
        if (red && typeof red[0] === 'string' && typeof red[1] === 'string' && red.length === 0 && red[0].length >= 10 && red[1].length >= 10) {
            return red as string[]
        } else {
            const keys = genCookieKeys()
            db.data['cookieKeys'] = keys
            await db.write()
            return keys
        }
    } catch (error) {
        try {
            db.data['cookieKeys'] = null
            await db.write()
        } catch (error) {
            console.error("Database PROBLEM", error)
        }
        return genCookieKeys()
    }
}

async function asyncGetJWKs(): Promise<any> {
    try {
        await db.read()
        const red = db.data['jwks'] as any
        if (red && Array.isArray(red.keys) && red.keys.length > 0) {
            return red as any
        } else {
            const keys = await genJWKs()
            db.data['jwks'] = keys as any
            await db.write()
            return keys
        }
    } catch (error) {
        try {
            db.data['jwks'] = await genJWKs()
            await db.write()
        } catch (error) {
            console.error("Database PROBLEM", error)
        }
        return db.data['jwks']
    }
}

let cookieKeys = genCookieKeys()
let jwks = null

async function initKeys() {
    cookieKeys = await asyncGetCookieKeys()
    jwks = await asyncGetJWKs()
}

function getCookieKeys() {
    return cookieKeys
}


function getJWKs() {
    return jwks
}


async function genJWKs() {
    const keyStore = JWK.createKeyStore()
    await keyStore.generate('RSA', 2048, { alg: 'RS256', use: 'sig' })
    const key = keyStore.toJSON(true)

    return key
}

export { initKeys, getCookieKeys, getJWKs }
