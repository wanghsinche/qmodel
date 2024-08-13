
export async function retrieveQDIIFromJiSiLu(){
    const url = new URL('https://www.jisilu.cn/data/qdii/qdii_list/E?___jsl=LST___t=1723376893136&rp=22&page=1')
    url.searchParams.set('___jsl=LST___t', Date.now()+'')
    const res = await fetch(url.toString()).then(res=>res.json())

    return res
}
