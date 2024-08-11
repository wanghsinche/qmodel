import axios from 'axios'
import path from 'path'
import fs from 'fs';

const today = new Date().toDateString()

const dataFolder = path.resolve(__dirname, '../data', today)

if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder)
}

export async function retrieveQDIIFromJiSiLu(){
    const url = new URL('https://www.jisilu.cn/data/qdii/qdii_list/E?___jsl=LST___t=1723376893136&rp=22&page=1')
    url.searchParams.set('___jsl=LST___t', Date.now()+'')
    const res = await axios.get(url.toString())

    const fileName = path.resolve(dataFolder, `QDII_jisilu.json`);

    fs.writeFileSync(fileName, JSON.stringify(res.data, null, 2))

    console.info(`Save to ${fileName}`);

}

if (require.main===module){
    retrieveQDIIFromJiSiLu();
}

