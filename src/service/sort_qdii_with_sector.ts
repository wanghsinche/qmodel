import fs from 'fs';
import path from 'path';

const today = new Date().toDateString()

const dataFolder = path.resolve(__dirname, '../data', today);

type ILooseOBJECT = Record<string, number | string>

interface IGroupItem {
    code: string,
    name: string,
    index_nm: string
    premium: string;
    last_est_dt: string;
    mt_fee: string;
}


export function groupQDII() {
    const qdiiData = fs.readFileSync(path.join(dataFolder, 'QDII_jisilu.json'), 'utf8');
    const data = JSON.parse(qdiiData);

    const QDIIAbstract: Array<IGroupItem> = data.rows.map((row: Record<string, number | string | ILooseOBJECT>) => {
        const cell = row.cell as Record<string, number | string>;
        return {
            code: row.id,
            name: cell.fund_nm,
            index_nm: cell.index_nm,
            premium: cell.discount_rt as string,
            last_est_dt: cell.last_est_dt as string,
            mt_fee: cell.mt_fee as string,
        }
    })

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


if (require.main === module) {
    const gp = groupQDII();
    const sortedGp = sortETFGroup(gp);
    // print the value table by key
    sortedGp.forEach((group) => {
        console.log(`Index: ${group.index}`);
        console.table(group.etfs)
    });
}