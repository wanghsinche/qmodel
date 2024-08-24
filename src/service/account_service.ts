import { getDB } from './store';
import z from 'zod';
import {getPayloadFromSignature, signPayload, verifySignature} from './token';
export interface IUserAccount {
    id: string
    brithday: string
    password?: string
    phone?: string
    nikename?: string
}

export const accountValidator = z.object({
    id: z.string().email(),
    brithday: z.string(),
    password: z.string().optional(),
    phone: z.string().optional(),
    nikename: z.string().optional(),
  }).strict();
  

export async function getUserAccount(id: string) {
    const accountsDB = getDB('account');
    const account = await accountsDB.get(id);
    if (account) {
        return JSON.parse(account) as IUserAccount
    }
    return null
}

export async function isExistUserAccount(id: string) {
    const accountsDB = getDB('account');
    const account = await accountsDB.get(id);
    if (account) {
        return true
    }
    return false
}

export async function updateUserAccount(id: string, account: IUserAccount) {
    accountValidator.parse(account)
    const accountsDB = getDB('account');
    await accountsDB.put(id, JSON.stringify(account))
}

export async function createUserAccount(account: IUserAccount) {
    accountValidator.parse(account)
    if (await isExistUserAccount(account.id)) {
        throw new Error('User already exists')
    }
    const accountsDB = getDB('account');
    await accountsDB.put(account.id, JSON.stringify(account))
    const token = await signJWT(account)
    return token
}

export async function signJWT(account: IUserAccount) {
    return signPayload(account.id)
}

export async function verifyJWT(token: string) {
    return verifySignature(token)
}

export async function decodeAndVerifyJwtToken(token: string) {
    const result = await verifyJWT(token)
    if (result) {
        const id = getPayloadFromSignature(token)
        const user = await getUserAccount(id)
        return user
    }
    return null
}
    


export async function loginAccount(account: IUserAccount) {
    const user = await getUserAccount(account.id);
    if (user) {
        if (user.password) {
            if (user.password === account.password) {
                const token = await signJWT(account)
                return token
            }
        }
        if (user.brithday) {
            if (user.brithday === account.brithday) {
                const token = await signJWT(account)
                return token
            }
        }
    }    
}

export async function checkAccountUsed(id: string) {
    const accountsDB = getDB('account');
    const account = await accountsDB.get(id);
    if (account) {
        return true
    }
    return false
}