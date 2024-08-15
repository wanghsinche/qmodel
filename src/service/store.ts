import type { KVNamespace } from '@cloudflare/workers-types';
import MemoKV from '../common/memo_kv';

interface Env {
    data_cache: KVNamespace
    STRIPE_SECRET_KEY: string
    accounts_db: KVNamespace
}


const memoKV = new MemoKV();
const memoAccountDB = new MemoKV();

let ctxEnv:Env;

export function initLoadEnv(e: Env){
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

export function getAccountsDB(){
    if (ctxEnv) {
        return ctxEnv.accounts_db
    }
    return memoAccountDB
}