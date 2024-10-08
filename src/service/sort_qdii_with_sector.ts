import { getKV } from "./store";
import { retrieveQDIIFromJiSiLu } from "./store_qdii_from_jisilu";


type ILooseOBJECT = Record<string, number | string>

interface IGroupItem {
    code: string,
    name: string,
    index_nm: string
    premium: string;
    last_est_dt: string;
    mt_fee: string;
    price_dt: string;
    profile_url: string;
    issuer_nm: string;
}
const prefix = 'QDII_jisilu_';

export async function getQDIIAbstract(){
    const today = new Date().toDateString()
    const dataPath = `${prefix}${today}`;

    let qdiiData = await getKV().get(dataPath);
    if (!qdiiData) {
        const result = await retrieveQDIIFromJiSiLu();
        await getKV().put(dataPath, JSON.stringify(result)||'', {
            expirationTtl: 60 * 60 * 24
        });
        qdiiData = await getKV().get(dataPath);
    }
    const data = JSON.parse(qdiiData as string);

    const QDIIAbstract: Array<IGroupItem> = data.rows.map((row: Record<string, number | string | ILooseOBJECT>) => {
        const cell = row.cell as Record<string, number | string>;
        return {
            code: row.id,
            name: cell.fund_nm,
            index_nm: cell.index_nm,
            premium: cell.discount_rt as string,
            last_est_dt: cell.last_est_dt as string,
            mt_fee: cell.mt_fee as string,
            price_dt: cell.price_dt as string,
            profile_url: cell.urls as string,
            issuer_nm: cell.issuer_nm as string
        }
    })

    return QDIIAbstract
}

export async function groupQDII() {
    

    const QDIIAbstract = await getQDIIAbstract()

    const groupedETFs = QDIIAbstract.reduce((groups: Record<string, IGroupItem[]>, etf) => {
        const index = etf.index_nm;
        if (!groups[index]) {
            groups[index] = [];
        }
        groups[index].push(etf);
        return groups;
    }, {});

    return groupedETFs;

}

export function sortETFGroup(groups:Record<string, IGroupItem[]>){
    return Object.entries(groups).map(([index, etfs]) => ({
        index,
        etfs: etfs.sort((a, b) => {
            const premiumA = parseFloat(a.premium);
            const premiumB = parseFloat(b.premium);
            const mt_feeA = parseFloat(a.mt_fee);
            const mt_feeB = parseFloat(b.mt_fee);
            return (premiumA - premiumB) || (mt_feeA - mt_feeB);
        }),
    }));
}


