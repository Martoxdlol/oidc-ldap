import config from "../config";
import ldap, { EqualityFilter, SearchOptions } from 'ldapjs'
import { LDAPUserProfile, queryAttributes, RawLDAPProfile } from "./profile";

function findRawUser(username): Promise<RawLDAPProfile> {
    let resolved = false

    return new Promise((resolve, reject) => {

        // Create client and bind to AD
        const client = ldap.createClient({
            url: [config.LDAPConfig.host]
        })

        client.bind(config.LDAPConfig.adminBindDN, config.LDAPConfig.adminBindPassword, err => {
            if (err) reject(err)
        })

        // Search AD for user
        const searchOptions: SearchOptions = {
            scope: "sub",
            filter: new EqualityFilter({
                attribute: config.LDAPConfig.usernameAttribute,
                value: username
            })
        }

        if (!config.LDAPConfig.queryAllAttributes) {
            searchOptions.attributes = queryAttributes
        }

        client.search(config.LDAPConfig.searchBaseDN, searchOptions, (err, res) => {
            res.on('searchEntry', entry => {
                resolved = true
                resolve(entry.object as any as RawLDAPProfile)
            })
            res.on('searchReference', referral => {

            })
            res.on('error', err => {
                if (err) reject(err)
            })
            res.on('end', result => {
                if (!resolved) resolve(null)
            })
        })

        // Wrap up
        client.unbind(err => {
            console.error(err)
        })
    })
}

async function findUser(username: string) {
    const raw = await findRawUser(username)
    if(!raw) return null
    return new LDAPUserProfile(raw)
}

export { findUser, findRawUser }