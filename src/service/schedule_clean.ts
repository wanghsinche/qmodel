import { getKV } from './store';

async function scheduleClean(prefix: string) {
    const namespace = await getKV();
    // list all keys with prefix

    try {
        // Fetch all keys with the specified prefix
        const listResponse = await namespace.list({
            prefix: prefix,
            limit: 500
        });
        // Delete each key found
        for (const key of listResponse.keys) {
            await namespace.delete(key as unknown as string);
            console.log(`Deleted key: ${key?.name}`);
        }
        
        console.log(`Successfully cleared all KV items with prefix: ${prefix}`);
    } catch (error) {
        console.error(`Error clearing KV items: ${error}`);
    }

}

export async function scheduleCleanAll() {
    await scheduleClean('premium_detail_')
    await scheduleClean('QDII_jisilu_')
    await scheduleClean('nasdaq100-')
}