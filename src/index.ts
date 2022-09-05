import getApp, { body, setNoCache } from "./app"
import { initKeys } from "./keys"
import getProvider from "./provider"
import interactionConfirmRouteHandler from "./routes/confirm"
import interactionRouteHandler from "./routes/interaction"
import interactionLoginRouteHandler from "./routes/login"

async function main() {

    await initKeys()
    const provider = getProvider()
    const app = getApp()

    app.get('/interaction/:uid', setNoCache, interactionRouteHandler)
    app.post('/interaction/:uid/login', setNoCache, body, interactionLoginRouteHandler)
    app.post('/interaction/:uid/confirm', setNoCache, body, interactionConfirmRouteHandler)

    app.use("/", provider.callback())
}

main()
