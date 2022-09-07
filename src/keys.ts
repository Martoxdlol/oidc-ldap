import { keysDB } from "./db";
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

async function genJWKs() {
    const keyStore = JWK.createKeyStore()
    await keyStore.generate('RSA', 2048, { alg: 'RS256', use: 'sig' })
    const key = keyStore.toJSON(true)

    return key
}

class KeyDatabseInterface {
    generate: () => any
    validate: (any) => boolean
    name: string
    _value: any = null

    constructor(name: string, generate: () => any, validate: (any) => boolean) {
        this.generate = generate
        this.validate = validate
        this.name = name
    }

    get value() {
        return this._value
    }

    async get() {
        this._value = await this._get()
        return this._value
    }

    async _get() {
        try {
            const doc = await keysDB.asyncFindOne({ _id: this.name }) as any
            const value = doc ? doc.value : null

            if (!value) {
                const generated = await this.generate()
                try {
                    keysDB.insert({ _id: this.name, value: generated })
                } catch (error) {
                    console.error("Error saving new generated key for " + this.name)
                }

                return generated
            }

            try {
                if (!this.validate(value)) throw true
            } catch (error) {
                console.error("Value for " + this.name + " is invalid")
            }

            return value
        } catch (error) {
            console.error("Error reading key for " + this.name)
            return await this.generate()
        }
    }
}

const cookiesKeys = new KeyDatabseInterface('cookies', genCookieKeys, keys => {
    return keys && typeof keys[0] === 'string' && typeof keys[1] === 'string' && keys.length === 0 && keys[0].length >= 10 && keys[1].length >= 10
})

const jwksKeys = new KeyDatabseInterface('jwks', genJWKs, keys => {
    return keys && Array.isArray(keys.keys) && keys.keys.length > 0
})

async function initKeys() {
    await cookiesKeys.get()
    await jwksKeys.get()
}

function getCookieKeys() {
    return cookiesKeys.value
}

function getJWKs() {
    return jwksKeys.value
}


export { initKeys, getCookieKeys, getJWKs, randString }
