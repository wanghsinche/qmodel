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

function addNamespacePrefixToFunctionParam(namespace:string) {
    return (kv:KVNamespace|MemoKV)=>{
        // add namespace prefix 
        function get(key:string) {
            return kv.get(`${namespace}::${key}`)
        }

        function put(key:string, value:string) {
            return kv.put(`${namespace}::${key}`, value)
        }
        
        function deleteFn(key:string) {
            return kv.delete(`${namespace}::${key}`)
        }

        return {
            get,
            put,
            delete: deleteFn
        }
    }
}

export function getDB(namespace: 'account'|'product'){
    const prefixFN = addNamespacePrefixToFunctionParam(namespace)
    if (ctxEnv) {
        return prefixFN(ctxEnv.accounts_db)
    }
    return prefixFN(memoAccountDB)
}

