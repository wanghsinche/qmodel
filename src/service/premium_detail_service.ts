// setup imports
import { format, parse } from 'date-fns';
import { getKV } from './store';
import { getQDIIAbstract } from './sort_qdii_with_sector';

const prefix = 'premium_detail_';

async function getFromCacheOrUrl(url:string) {
    const today = new Date().toDateString();
    const cache = await getKV().get(`${prefix}${today}${url}`);
    if (cache) {
        return cache
    } else {
        const text = await fetch(url).then(res=>res.text());
        getKV().put(`${prefix}${today}${url}`, text, {
          expirationTtl: 60 * 60 * 24
        });
        return text
    }
}

const getNetValueFromTencent = async (code:string, start:Date, end:Date) => {
  const startStr = format(start, 'yyyyMMdd');
  const endStr = format(end, 'yyyyMMdd');
  const url = `https://stockjs.finance.qq.com/fundUnitNavAll/data/year_all/${code}.js`;

  const jsonStr = await getFromCacheOrUrl(url);

  const data = JSON.parse(jsonStr.slice(19)).data;
  const dataInRange = data.filter((item: string[]) => {
    const date = item[0].replace(/-/g, '');
    return date >= startStr && date <= endStr;
  }) as [string, string][];

  return dataInRange.map(item => [item[0].replace(/-/g, ''), parseFloat(item[1])]) as [string, number][];
};

const getClosePriceFromSohu = async (code:string, start:Date, end:Date) => {
  const startStr = format(start, 'yyyyMMdd');
  const endStr = format(end, 'yyyyMMdd');
  const url = `https://q.stock.sohu.com/hisHq?start=${startStr}&end=${endStr}&stat=1&order=D&period=d&callback=historySearchHandler&code=cn_${code}`;

  const jsonStr = await getFromCacheOrUrl(url);


  const data = JSON.parse(jsonStr); // slice to remove callback wrapper
  // "[\"2024-08-22\",\"1.909\",\"1.892\",\"-0.002\",\"-0.11%\",\"1.889\",\"1.909\",\"1887299\",\"35819.090\",\"7.64%\"]"
  // 高 收 变动 幅度 低 开 量 额度 溢价
  return data[0].hq.map((item:[string, string, string]) => [item[0].replace(/-/g, ''), parseFloat(item[2]), JSON.stringify(item)]) as [string, number, string][];
};

const calculatePremium = (closePrice:[string, number, string][], netValue: [string, number][]) => {
  const premium: { date: Date, close: number, netValue: number, premium: number, another: string }[] = [];
  closePrice.forEach(close => {
    netValue.forEach(net => {
      if (close[0] === net[0]) {
        let itsPremium = parseFloat((close[1] / net[1] - 1).toFixed(4));
        premium.push({ date: parse(close[0], 'yyyyMMdd', new Date()), close: close[1], netValue: net[1], premium: itsPremium, another: close[2] });
      }
    });
  });
  return premium;
};

export const getPremiumDetail = async (code:string, start:Date, end:Date) => {
  const closePrice = await getClosePriceFromSohu(code, start, end);
  const netValue = await getNetValueFromTencent(code, start, end);
  return calculatePremium(closePrice, netValue);
}

export async function getETFProfile(code:string) {
  const groupData = await getQDIIAbstract();
  const etf = groupData.find(item => item.code === code);
  return etf
}