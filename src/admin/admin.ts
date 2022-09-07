import assert from "assert"
import { body, setNoCache } from "../app"
import config from "../config"
import { clientsDB } from "../db"
import { getCookieKeys, randString } from "../keys"
import cookieSession from 'cookie-session'

type Client = {
    client_secret: string
    client_id: string
    name: string
    callbacks: string[]
}

function assertId(id: string) {
    assert.equal(typeof id, 'string')
    assert.equal(id.length > 0, true)
}

export default function admin(app: any) {
    if (!config.adminConfig || !config.adminConfig.enabled) return

    app.use('/admin', cookieSession({
        name: 'session',
        keys: getCookieKeys(),
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }))

    app.get('/admin/login', (req, res) => {
        res.render('admin-login', { config })
    })

    app.post('/admin/login', body, setNoCache, async (req, res) => {
        if (req.body.username === config.adminConfig.username && req.body.password === config.adminConfig.password) {
            req.session.isAdmin = true
            res.redirect('/admin/clients')
        } else {
            res.render('admin-login', { config, error: 'Invalid credentials' })
        }
    })

    app.get('/admin/exit', (req, res) => {
        res.redirect('/admin/login')
    })

    app.use('/admin', (req, res, next) => {
        console.log("Session", req.session)
        if (req.session.isAdmin === true) {
            next()
        } else {
            res.redirect('/admin/login')
        }
    })

    app.get('/admin/clients', body, setNoCache, async (req, res) => {
        const clients = await clientsDB.asyncFind({})
        res.render('clients', { config, clients })
    })

    app.get('/admin/clients/:id', body, setNoCache, async (req, res) => {
        const client = await clientsDB.asyncFindOne({ _id: req.params.id }) as any
        if (!client) {
            res.redirect('/admin/clients')
            return
        }
        res.render('client', { config, ...client })

    })

    app.get('/admin/add-client', body, setNoCache, (req, res) => {
        res.render('set-client', { config, id: 'new', edit: false, callbacks: [], name: 'App name' })
    })

    app.get('/admin/edit-client/:id', body, setNoCache, async (req, res) => {
        const id = req.params.id
        const client = await clientsDB.asyncFindOne({ _id: id }) as any

        if (!client) {
            res.redirect('/admin/add-client')
            return
        }

        res.render('set-client', { config, id: req.params.id, ...client, edit: true })
    })

    app.post('/admin/save-client/:id', body, setNoCache, async (req, res) => {
        const name = req.body.name + ''
        const callbacks = (req.body.callbacks + '').split(',').map(uri => uri.trim())

        const id: string = req.params.id
        assertId(id)

        const isNew = id === 'new'


        let data: Client
        if (isNew) {
            data = {
                client_id: randString(48),
                client_secret: randString(24),
                name: name,
                callbacks: callbacks,
            }
        } else {
            data = await clientsDB.asyncFindOne({ _id: id })

            if (!data) return res.send("Client not found")

            data.callbacks = callbacks
            data.name = name
        }

        if (isNew && await clientsDB.asyncFindOne({ client_id: data.client_id })) {
            throw new Error("OOOPSSS")
        }

        const callbacks_string = '[' + data.callbacks.join(', ') + ']'


        let result
        if (isNew) {
            result = await clientsDB.asyncInsert(data)
        } else {
            result = await clientsDB.asyncUpdate({ _id: id }, { name: data.name, callbacks: data.callbacks })
        }

        res.redirect('/admin/clients/' + result._id)
    })

    app.post('/admin/remove-client/:id', body, setNoCache, async (req, res) => {
        assertId(req.params.id)
        await clientsDB.asyncRemove({ _id: req.params.id })
        res.redirect('/admin/clients/')
    })
}