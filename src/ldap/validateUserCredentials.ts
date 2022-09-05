import { authenticate, AuthenticationOptions } from 'ldap-authentication'
import config from '../config'

export type CredentialsValidarionResult = {
    error: Error | null
    user: any | null
}

const validateUserCredentials = async function validateUserCredentials(username: string, password: string): Promise<CredentialsValidarionResult> {
    try {
        // auth with admin
        let options: AuthenticationOptions = {
            ldapOpts: {
                url: config.LDAPConfig.host,
                // tlsOptions: { rejectUnauthorized: false }
            },
            adminDn: config.LDAPConfig.adminBindDN,
            adminPassword: config.LDAPConfig.adminBindPassword,
            userPassword: password,
            userSearchBase: config.LDAPConfig.searchBaseDN,
            usernameAttribute: config.LDAPConfig.usernameAttribute,
            username: username,
            // starttls: false
        }

        const user = await authenticate(options)
        if (!user) {
            throw new Error()
        }
        return {
            user,
            error: null
        }
    } catch (error) {
        return {
            error,
            user: null
        }
    }
}

export default validateUserCredentials