import { Configuration, Provider } from 'oidc-provider'
import claims, { allClaims } from './claims';
import config from './config';
import { getCookieKeys } from './keys';
import { findUser } from './ldap/findUser';
import { LDAPUserProfile, queryAttributes } from './ldap/profile';

function makeProvider() {
    const providerConfiguration: Configuration = {
        clients: [
            {
                client_id: "oidcCLIENT",
                client_secret: "Some_super_secret",
                grant_types: ["authorization_code"],
                redirect_uris: ["http://localhost:8080/auth/login/callback", "https://oidcdebugger.com/debug", "https://openidconnect.net/callback", "https://coder.henryford.edu.ar/oidc/callback"],
                response_types: ["code",],
            }
        ],
        cookies: {
            keys: getCookieKeys()
        },
        features: {
            devInteractions: { enabled: false }, // defaults to true

            deviceFlow: { enabled: true }, // defaults to false
            revocation: { enabled: true }, // defaults to false
        },
        pkce: {
            methods: ['S256', 'plain'],
            required: () => false,
        },
        renderError: (ctx, out, error) => {
            console.log(error)
            out.error = error.message
        },
        async findAccount(ctx, id) {
            let account: LDAPUserProfile
            if (typeof id == 'string') {
                account = await findUser(id)
            } else {
                throw new TypeError('Invalid user id')
            }

            return {
                accountId: id,
                async claims(use, scope, claims, reserved) {
                    const attrs = {}
                    for (const claim of allClaims) {
                        attrs[claim] = account[claim]
                    }
                    return { ...attrs, sub: id };
                },
            };
        },
        claims: claims,
    }

    return new Provider(config.issuer, providerConfiguration);
}


let provider: Provider = null

function getProvider() {
    if (!provider) provider = makeProvider()
    return provider
}

export default getProvider

