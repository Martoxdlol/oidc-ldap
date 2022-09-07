import config, { runningOnDocker } from "./config";
import express, { NextFunction, Request, Response, urlencoded } from 'express'
import path from 'path'
import getProvider from "./provider";

const body = urlencoded({ extended: false })

function setNoCache(req: Request, res: Response, next: NextFunction) {
    res.set('cache-control', 'no-store')
    next()
}

function makeApp() {

    const provider = getProvider()

    const app = express()

    app.use(express.static(path.resolve('public')));

    if (runningOnDocker) {
        app.use(express.static('/public'));
    }

    app.set('views', path.resolve('src/views'));
    app.set('view engine', 'pug');

    if (config.forceHTTPS) {
        provider.proxy = true
        provider.app.proxy = true
        app.use((req, res, next: NextFunction) => {
            req.headers['x-forwarded-proto'] = 'https'
            next()
        })
    }



    app.listen(config.httpPort, '0.0.0.0', () => {
        console.log(`Oauth2.0 + OpenID Connect server (${config.visibleTitle}) listening on 0.0.0.0 port: ${config.httpPort}`)
    })

    return app
}

let app = null

export default function getApp() {
    if (!app) app = makeApp()
    return app
}

export { body, setNoCache }


