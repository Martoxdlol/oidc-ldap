import * as dotenv from 'dotenv'

/**
 * Configurations is readed from envirnonment variables or .env file
 * It uses example.env as default
*/
dotenv.config({ path: 'example.env', override: false })
dotenv.config({ override: true })

interface LDAPConfig {
    host: string // Example: ldap://ad.server.example.com
    searchBaseDN: string // Example: CN=Users,DC=ad,DC=server,DC=example,DC=com
    adminBindDN: string // Example: CN=bind_user,CN=Users,DC=ad,DC=server,DC=example,DC=com
    adminBindPassword: string
    usernameAttribute: string // Example: sAMAccountName, Example: name
    notIncludeDefaultAttributes: boolean
    includeAttributes: string[]
    excludeAttributes: string[]
    queryAllAttributes: boolean
}

interface SMTPConfig {
    host: string // example: mail.stmp-sever.example
    port: number // example: 465
    secure: boolean // example: true
    username: string // example: email_service_user
    password: string
    sendFrom: string // example: password-reset@example.com
}

interface AppConfig {
    // HTTP listen port
    httpPort: number
    // Example: https://auth.example-oatuh-provider.com
    // Is the public url where this app is been deployed
    issuer: string
    // Tells the openid provider to use https links 
    // when it is been used under a http proxy
    forceHTTPS: boolean
    // Image visible on the web UI 
    visibleImageFile: string
    // Title for the web UI
    visibleTitle: string
    // Description on the web UI
    visibleDescription: string
    // Configuration for LDAP auth
    LDAPConfig: LDAPConfig
    // Configuration for sending emails (used for resetting passwords)
    SMTPConfig?: SMTPConfig
    // Enable LDAP user password reset via email
    enablePasswordReset: boolean
}

const ENABLE_PASSWORD_RESET = env_bool('ENABLE_PASSWORD_RESET', false)

const config: AppConfig = {
    httpPort: env_int('HTTP_PORT', 3000),
    issuer: env('ISSUER', 'Issuer must be provided. Ex: https://auth.example-oatuh-provider.com'),
    forceHTTPS: env_bool('FORCE_HTTPS', false),
    visibleDescription: env_string('VISIBLE_DESCRIPTION', 'Authentication service'),
    visibleTitle: env_string('VISIBLE_TITLE', 'authenticate with LDAP'),
    visibleImageFile: env_string('VISIBLE_IMAGE_FILE', '/assets/banner.png'),
    enablePasswordReset: ENABLE_PASSWORD_RESET,
    LDAPConfig: {
        adminBindDN: env('LDAP_ADMIN_BIND_DN', 'LDAP account DISTINGUISHED NAME used to authenticate users must be defined'),
        adminBindPassword: env('LDAP_ADMIN_BIND_PASSWORD', 'LDAP account PASSWORD used to authenticate users must be defined'),
        host: env('LDAP_HOST', 'LDAP host must be defined'),
        searchBaseDN: env('LDAP_SEARCH_BASE_DN', 'LDAP Search base must be defined'),
        usernameAttribute: env_string('LDAP_USERNAME_ATTRIBUTE', 'name'),
        notIncludeDefaultAttributes: env_bool('LDAP_NOT_INCLUDE_DEFAULT_ATTRIBUTES', false),
        includeAttributes: env_string('LDAP_INCLUDE_ATTRIBUTES', '').split(','),
        excludeAttributes: env_string('LDAP_EXCLUDE_ATTRIBUTES', '').split(','),
        queryAllAttributes: env_bool('LDAP_QUERY_ALL_ATTRIBUTES', false)
    },
}

if (ENABLE_PASSWORD_RESET) {
    config.SMTPConfig = {
        host: env('SMTP_HOST', 'SMTP host must be defined'),
        username: env('SMTP_USERNAME', 'SMTP username must be defined'),
        password: env('SMTP_USER_PASSWORD', 'SMTP user password must be defined'),
        port: env_int('SMTP_PORT', 465),
        secure: env_bool('SMTP_SECURE', true),
        sendFrom: env('SMTP_SEND_FROM', 'Email sender address must be defined'),
    }
}

function env_bool(envName: string, _default: boolean) {
    return (process.env[envName] || _default.toString()).toLocaleLowerCase().trim() === 'true'
}

function env_string(envName: string, _default: string) {
    return (process.env[envName] || _default.toString())
}

function env_int(envName: string, _default: number) {
    const v = process.env[envName]
    if (v === undefined) return _default
    const n = parseInt(v)
    if (Number.isInteger(n)) return n
    return _default
}

function env(name: string, error: string): string {
    const value = process.env[name]
    if (typeof value === 'string') {
        return value
    }
    throw new ConfigError(name, error)
}

class ConfigError extends Error {
    envName: string
    constructor(envName: string, message: string) {
        super(message)
        this.envName = envName
    }

    toString(): string {
        return `Configuration error []: ${this.message}`
    }
}

const runningOnDocker = process.env.RUNNING_ON_DOCKER

export { runningOnDocker }

export default config 