import admin from "./admin/admin"
import getApp, { body, setNoCache } from "./app"
import config from "./config"
import { initDb } from "./db"
import { initKeys } from "./keys"
import getProvider from "./provider"
import interactionConfirmRouteHandler from "./routes/confirm"
import interactionRouteHandler from "./routes/interaction"
import interactionLoginRouteHandler from "./routes/login"

async function main() {

    await initDb()
    await initKeys()
    const provider = getProvider()
    const app = getApp()

    app.get('/', (req, res) => res.render('index', { config }))
    app.get('/interaction/:uid', setNoCache, interactionRouteHandler)
    app.post('/interaction/:uid/login', setNoCache, body, interactionLoginRouteHandler)
    app.post('/interaction/:uid/confirm', setNoCache, body, interactionConfirmRouteHandler)

    admin(app)

    app.use("/", provider.callback())
}

export default main
