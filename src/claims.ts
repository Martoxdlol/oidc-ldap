import { queryAttributes } from "./ldap/profile"

export interface Claims {
    [key: string]: string[]
}

const claims: Claims = {
    address: ['address'],
    email: ['email', 'email_verified'],
    phone: ['phone_number', 'phone_number_verified'],
    profile: [
        // 'birthdate',
        'family_name',
        // 'gender',
        'given_name',
        // 'locale',
        // 'middle_name',
        'display_name',
        'login',
        'username',
        'name',
        // 'nickname',
        // 'picture',
        'preferred_username',
        // 'profile',
        'updated_at',
        'website',
        'zoneinfo',
    ],
    groups: ['member_of'],
    ldap_attributes: queryAttributes.map(attr => 'ldap_' + attr),
    
    ldap_raw_object: ['ldap_raw_object'],

    ...queryAttributes.map(attr => 'ldap_' + attr).reduce((acc, key) => {
        acc[key] = [key]
        return acc
    }, {})
}

const allClaims = []
for (const key in claims) {
    allClaims.push(...claims[key])
}

export {
    allClaims
}
export default claims