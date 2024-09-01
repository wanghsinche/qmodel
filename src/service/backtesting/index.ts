// GitHub repository information

import { Release } from "./typing";
import { getKV } from '../store';

const repo = 'wanghsinche/qmodel';

// Construct the API URL to fetch the releases
async function getLatestRelease(index: string) {
    const apiUrl = `https://api.github.com/repos/${repo}/releases`;

    const response = await fetch(apiUrl);
    const releaseList: Release[] = await response.json();

    // find out the latest release starts with index
    const latestRelease = releaseList
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .find(release => release.name.includes(index));

    // download assets
    if (latestRelease) {
        const allDownloads = await Promise.all(latestRelease.assets
            .filter((asset) => asset.name.endsWith('.csv')).map(async (asset) => {
                const response = await fetch(asset.browser_download_url);
                const text = await response.text();
                return {
                    name: asset.name,
                    csvText: text
                }
            }))

        return allDownloads
    }
}


function readCSVAndConvertToJSON(text:string) {

    const lines = text.split('\n');
    const headers = lines[0].split(',');
    const result = [] as Record<string, string>[] ;
    for (let i = 1; i < lines.length; i++) {
        const obj = {} as Record<string, string>;
        if (lines[i].trim() === '') continue
        const currentLine = lines[i].split(',');
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j].trim()] = currentLine[j]?.trim();
        }
        result.push(obj);
    }

    return result
}

export async function getBacktestingDataFromRemote(index: string) {
    const assets = await getLatestRelease(index);
    if (!assets) {
        throw new Error(`No assets found ${index}`);
    }
    const allDownloads = await Promise.all(assets.map(async (file) => {
        const csv = await readCSVAndConvertToJSON(file.csvText);
        return { csv, name: file.name }
    }))
    return allDownloads
}

export async function getBacktestingData(index = 'nasdaq100') {
    // get from kv cache
    const allFiles = [
        `${index}-myorders.csv`,
        `${index}-mystats.csv`,
        `${index}-other_stats.csv`,
    ]
    const today = new Date().toDateString()

    const kv = await getKV();
    let data: {
        csv: Record<string, string>[];
        name: string;
    }[]
    try {
        data = await Promise.all(allFiles.map(async (file) => {
            const data = await kv.get(`${file}::${today}`);
            if (!data) {
                throw new Error(`No data found ${file}`);
            }
            return {
                name: file,
                csv: JSON.parse(data)
            }
        }))
    } catch (error) {
        console.info(error)
        data = await getBacktestingDataFromRemote(index);
        await kv.put(`${index}-myorders.csv::${today}`, JSON.stringify(data.find(el=>el.name === `${index}-myorders.csv`)?.csv))
        await kv.put(`${index}-mystats.csv::${today}`, JSON.stringify(data.find(el=>el.name === `${index}-mystats.csv`)?.csv))
        await kv.put(`${index}-other_stats.csv::${today}`, JSON.stringify(data.find(el=>el.name === `${index}-other_stats.csv`)?.csv))
    }

    return {
        myOrders: data.find(el=>el.name === `${index}-myorders.csv`)?.csv,
        myStats: data.find(el=>el.name === `${index}-mystats.csv`)?.csv,
        otherStats: data.find(el=>el.name === `${index}-other_stats.csv`)?.csv
    }
}

