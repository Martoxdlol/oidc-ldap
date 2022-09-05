import config from "../config"

interface RawLDAPProfile {
    dn?: string
    controls?: string
    objectClass?: string[]
    cn?: string
    sn?: string
    title?: string
    givenName?: string
    distinguishedName?: string
    whenCreated?: string
    whenChanged?: string
    uSNCreated?: string
    memberOf?: string[]
    uSNChanged?: string
    name?: string
    objectGUID?: string
    userAccountControl?: string
    badPwdCount?: string
    codePage?: string
    countryCode?: string
    homeDirectory?: string
    homeDrive?: string
    badPasswordTime?: string
    lastLogoff?: string
    lastLogon?: string
    pwdLastSet?: string
    primaryGroupID?: string
    objectSid?: string
    adminCount?: string
    accountExpires?: string
    logonCount?: string
    sAMAccountName?: string
    sAMAccountType?: string
    userPrincipalName?: string
    lockoutTime?: string
    objectCategory?: string
    dSCorePropagationData?: string[]
    lastLogonTimestamp?: string
    mail?: string
    wWWHomePage?: string
    c?: string
    l?: string
    st?: string
    postOfficeBox?: string
    postalCode?: string
    telephoneNumber?: string
    description?: string
    displayName?: string
    [key: string]: string | string[]
}

class LDAPUserProfile {
    raw: RawLDAPProfile
    constructor(raw: RawLDAPProfile) {
        if (typeof raw[config.LDAPConfig.usernameAttribute] !== 'string') {
            throw new TypeError(`LDAP profile doesn't contain property ${config.LDAPConfig.usernameAttribute}`)
        }

        this.raw = raw
    }

    get id() {
        return this.raw[config.LDAPConfig.usernameAttribute]
    }

    get accountId(): string {
        return this.id as string
    }

    get address(): string | null {
        return this.raw.streetAddress ? `${this.raw.streetAddress}, ${this.raw.l}, ${this.raw.st}, , ${this.raw.co}` : null
    }

    get email(): string | null {
        return this.raw.mail ?? null
    }

    get email_verified(): boolean {
        return this.raw.mail ? true : false
    }

    get phone_number(): string | null {
        return this.raw.telephoneNumber ?? null
    }

    get phone_number_verified(): boolean {
        return this.raw.telephoneNumber ? true : false
    }

    get family_name() {
        return this.raw.sn ?? null
    }

    get given_name() {
        return this.raw.givenName ?? null
    }

    get display_name() {
        return this.raw.displayName ?? null
    }

    get name() {
        return `${this.given_name} ${this.family_name}`.trim()
    }

    get username() {
        return this.id
    }

    get login() {
        return this.username
    }

    get preferred_username() {
        return this.username
    }

    get updated_at() {
        return new Date(this.raw.whenChanged.split('.')[0])
    }

    get website() {
        return this.raw.wWWHomePage ?? null
    }

    get zoneinfo() {
        return this.raw.c ?? null
    }

    get groups(): string[] {
        return this.raw.memberOf || []
    }

    get member_of() {
        return this.groups
    }

    getAttribute(name: string) {
        return this.raw[name] ?? null
    }

    get rawObject() {
        return JSON.stringify(this.raw)
    }

    toString() {
        return `${this.username} -> ${this.rawObject.substring(0, 100)}`
    }
}


const defaultAttributes = [
    'dn',
    'controls',
    'objectClass',
    'cn',
    'sn',
    'title',
    'givenName',
    'distinguishedName',
    'whenCreated',
    'whenChanged',
    'displayName',
    'uSNCreated',
    'memberOf',
    'uSNChanged',
    'name',
    'objectGUID',
    'userAccountControl',
    'badPwdCount',
    'codePage',
    'countryCode',
    'homeDirectory',
    'homeDrive',
    'badPasswordTime',
    'lastLogoff',
    'lastLogon',
    'pwdLastSet',
    'primaryGroupID',
    'objectSid',
    'adminCount',
    'accountExpires',
    'logonCount',
    'sAMAccountName',
    'sAMAccountType',
    'userPrincipalName',
    'lockoutTime',
    'objectCategory',
    'dSCorePropagationData',
    'lastLogonTimestamp',
    'mail',
    'wWWHomePage',
    'c',
    'l',
    'st',
    'postOfficeBox',
    'postalCode',
    'telephoneNumber',
    'description',
]

const queryAttributes = new Set<string>()

if (!config.LDAPConfig.notIncludeDefaultAttributes) {
    for (const attr of defaultAttributes) {
        queryAttributes.add(attr)
    }
}

for (const attr of config.LDAPConfig.includeAttributes) {
    queryAttributes.add(attr)
}

for (const attr of config.LDAPConfig.excludeAttributes) {
    queryAttributes.delete(attr)
}

queryAttributes.add(config.LDAPConfig.usernameAttribute)

const queryAttributesList = Array.from(queryAttributes)

export { queryAttributesList as queryAttributes, RawLDAPProfile, LDAPUserProfile }