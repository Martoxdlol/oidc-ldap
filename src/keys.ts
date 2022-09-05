import db from "./db";

function genCookieKeys() {
    return [
        require('crypto').randomBytes(48).toString('hex'),
        require('crypto').randomBytes(48).toString('hex'),
    ]
}

async function asyncGetCookieKeys() {
    try {
        await db.read()
        const red = db.data['cookieKeys']
        if (red && typeof red[0] === 'string' && typeof red[1] === 'string' && red.length === 0 && red[0].length >= 10 && red[1].length >= 10) {
            return red
        } else {
            const keys = genCookieKeys()
            red.data['cookieKeys'] = keys
            await db.write()
            return keys
        }
    } catch (error) {
        try {
            db.data['cookieKeys'] = null
            await db.write()
        } catch (error) {
            console.error("Database PROBLEM")
        }
        return genCookieKeys()
    }
}

let cookieKeys = genCookieKeys()

async function initKeys() {
    cookieKeys = await asyncGetCookieKeys()
}


function getCookieKeys() {
    return cookieKeys
}

export { initKeys, getCookieKeys }