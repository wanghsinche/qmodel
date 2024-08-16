import { getEnv } from "./store";

const sep = '.'

async function sha256Digest(data:string) {
    const encoder = new TextEncoder();  // Create a new TextEncoder
    const encodedData = encoder.encode(data);  // Encode the data
    const hashBuffer = await crypto.subtle.digest('SHA-256', encodedData);  // Generate the digest
    return Array.from(new Uint8Array(hashBuffer))  // Convert ArrayBuffer to Uint8Array
        .map(b => b.toString(16).padStart(2, '0'))  // Convert bytes to hex
        .join('');  // Join the hex values into a single string
}

export async function signPayload(payload: string) {
    const key = getEnv().STRIPE_SECRET_KEY;
    const keyAndPayload = `${key}.${payload}`;
    const digest = await sha256Digest(keyAndPayload);
    const signature = `${digest}.${payload}`;
    return signature;
}

export async function verifySignature(signature:string) {
    const key = getEnv().STRIPE_SECRET_KEY;
    const sepIndex = signature.indexOf(sep);
    const digest = signature.slice(0, sepIndex);
    const payload = signature.slice(sepIndex + 1);
    const keyAndPayload = `${key}.${payload}`;
    const digest2 = await sha256Digest(keyAndPayload);
    if (digest === digest2) {
        return true;
    }
    return false;
}

export function getPayloadFromSignature(signature:string) {
    const sepIndex = signature.indexOf(sep);
    const payload = signature.slice(sepIndex + 1);
    return payload
}