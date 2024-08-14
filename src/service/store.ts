import type { KVNamespace } from '@cloudflare/workers-types';

interface Env {
    data_cache: KVNamespace
    STRIPE_SECRET_KEY: string
}

const memoKV = {
    store: {} as Record<string, string>,
    put(key: string, value: string):Promise<void> {
        const store = memoKV.store;
        store[key] = value;
        memoKV.store = store;
        return Promise.resolve()
    },
    get(key: string):Promise<string> {
        const store = memoKV.store;
        const value = store[key];
        if (value) {
            return Promise.resolve(value)
        }
        return Promise.resolve('')
    },
    delete(key: string):Promise<void>  {
        const store = memoKV.store;
        delete store[key];
        memoKV.store = store;
        return Promise.resolve()
    }
}

let ctxEnv:Env;

export function initStore(e: Env){
    ctxEnv = e
}


export function getKV(){
    if (ctxEnv) {
        return ctxEnv.data_cache
    }
    return memoKV
}

export function getEnv(){
    if (ctxEnv) {
        return ctxEnv
    }
    return process.env
}