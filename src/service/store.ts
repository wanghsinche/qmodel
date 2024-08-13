import type { KVNamespace } from '@cloudflare/workers-types';

interface Env {
    data_cache: KVNamespace
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


export function getStore(){
    if (ctxEnv) {
        console.info('store is ', ctxEnv.data_cache)
        return ctxEnv.data_cache
    }
    console.info('memo store')
    return memoKV
}