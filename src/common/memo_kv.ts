import { KVNamespaceListOptions, KVNamespaceListResult } from "@cloudflare/workers-types";

export default class MemoKV {

    store: Record<string, string> = {};

    put(key: string, value: string): Promise<void> {
        const store = this.store;
        store[key] = value;
        this.store = store;
        return Promise.resolve()
    }

    get(key: string): Promise<string> {

        const store = this.store;
        const value = store[key];
        if (value) {
            return Promise.resolve(value)
        }
        return Promise.resolve('')
    }

    delete(key: string): Promise<void> {
        const store = this.store;
        delete store[key];
        this.store = store;
        return Promise.resolve()
    }

    list<Metadata = unknown>(
        _options?: KVNamespaceListOptions,
    ): Promise<KVNamespaceListResult<Metadata, string>> {
        const result = {
            list_complete: true,
            keys: [],
            cursor: '',
            cacheStatus: 'HIT'
        }
        return Promise.resolve(result)
    }
}
