import { Link, useParams } from 'react-router-dom';
import useSWR from 'swr';
import { client } from '../client';
import { subDays, format } from 'date-fns';
import { Bar, BarChart, Brush, CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Descriptions, Space, Typography } from '@douyinfe/semi-ui';
import { Skeleton } from '@douyinfe/semi-ui';
import { ComponentProps } from 'react';

enum EQuantileRank {
    LOW = 0.25,
    MEDIUM = 0.5,
    HIGH = 0.7
}

const QuantileName = {
    [EQuantileRank.LOW]: '低风险',
    [EQuantileRank.MEDIUM]: '正常',
    [EQuantileRank.HIGH]: '高风险'
}

function calculateHistogram(data: number[], binSize: number) {
    if (!data || data.length === 0) {
        return []
    }
    // Find minimum and maximum values
    const min = Math.min(...data);
    const max = Math.max(...data);

    // Calculate the number of bins
    const numBins = Math.ceil((max - min) / binSize);

    // Initialize bins
    const bins = new Array(numBins).fill(0);
    const binLimits = new Array(numBins).fill(0).map((_, index) => min + index * binSize);

    // Assign data points to bins
    data.forEach(premium => {
        const binIndex = Math.floor((premium - min) / binSize);
        bins[binIndex]++;
    });

    // Resulting histogram data
    const histogramData = bins.map((count, index) => ({
        binStart: binLimits[index]?.toFixed(4),
        binEnd: (binLimits[index] + binSize).toFixed(4),
        count: count as number
    }));

    return histogramData;
}


export default function QDIIDetail() {
    const { code } = useParams<'code'>()
    const oneYearAgo = subDays(new Date(), 365)
    const now = new Date()
    const { data, isValidating } = useSWR(code && ['/api/qdii_detail', code], async () => {
        // await new Promise(resolve => setTimeout(resolve, 5000))
        return client.getQDIIPremium.query({ code: code as string, start: oneYearAgo, end: now })
    }, {
        revalidateOnFocus: false
    });

    const { data: profileData } = useSWR(code && ['/api/qdii_profile', code], async () => {
        // await new Promise(resolve => setTimeout(resolve, 5000))
        return client.getQDIIProfile.query(code as string)
    }, {
        revalidateOnFocus: false
    });


    const histogramDataset = calculateHistogram(data?.map(item => item.premium) as number[], 0.001).map(item => ({ premium: item.binStart, count: item.count }))

    const lineDataset = data?.map(item => ({ date: item.date, premium: item.premium, close: item.close, netValue: item.netValue })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())


    const currentPremium = parseFloat(profileData?.premium || '0') / 100
    // const latestDate = new Date(profileData?.last_est_dt)
    const latestFormattedDate = profileData?.last_est_dt

    // find out the nearest bin start of the current premium
    const currentPremiumBin = histogramDataset?.reduce((prev, curr) => {
        const currPremium = parseFloat(curr.premium)
        const prevPremium = parseFloat(prev.premium)
        const thePremium = currentPremium || 0
        if (!curr.premium) return prev
        if (Math.abs(currPremium - thePremium) > Math.abs(prevPremium - thePremium)) {
            return prev
        } else {
            return curr
        }
    }, { premium: '0', count: 0 })

    // get the Quantile of the current premium
    const quantileIndex = histogramDataset?.findIndex(item => item.premium === currentPremiumBin?.premium)

    const quantile = quantileIndex && quantileIndex / histogramDataset?.length
    let quantileRank = EQuantileRank.MEDIUM
    let quantileColor: ComponentProps<typeof Typography.Text>['type'] = 'success'
    if (quantile < EQuantileRank.LOW) {
        quantileRank = EQuantileRank.LOW
        quantileColor = 'success'
    } else if (quantile > EQuantileRank.HIGH) {
        quantileRank = EQuantileRank.HIGH
        quantileColor = 'danger'
    }

    const getLoadingDom = () => <Skeleton.Paragraph rows={4}/>

    return <div style={{ padding: '4px 4px 8px 4px', margin: '0 auto', width: '90%' }}>

        <Descriptions align="left" data={[
            { key: '基金名称', value: profileData?.name },
            { key: 'ETF 代码', value: code },
            {
                key: '基金档案', value: <Link to={profileData?.profile_url as string} target='_blank'>
                    <Typography.Text underline style={{ color: 'var( --semi-color-text-2)' }}>{profileData?.issuer_nm}</Typography.Text>
                </Link>
            },
            {
                key: '外部连接', value: <Space>
                    <Link to={`https://fund.eastmoney.com/${code}.html`} target='_blank'>
                        <Typography.Text underline style={{ color: 'var( --semi-color-text-2)' }}>天天基金</Typography.Text>
                    </Link>
                    <Link to={`https://www.jisilu.cn/data/qdii/detail/${code}`} target='_blank'>
                        <Typography.Text underline style={{ color: 'var( --semi-color-text-2)' }}> 集思录</Typography.Text></Link>
                </Space>
            },
            { key: '数据更新日期', value: latestFormattedDate },
            { key: '当前溢价', value: currentPremium ? (currentPremium * 100).toFixed(2) + '%' : '-' },
            { key: '当前溢价分位数', value: quantile ? (quantile * 100).toFixed(2) + '%' : '-' },
            { key: '当前溢价风险', value: <Typography.Text type={quantileColor}>{QuantileName[quantileRank]}</Typography.Text> },
        ]} />

        <Typography.Text >溢价直方图</Typography.Text>
        <Skeleton loading={isValidating} placeholder={getLoadingDom()}>
            <ResponsiveContainer width={'100%'} height={300} >
                <BarChart data={histogramDataset} height={300} width={500} >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="premium" name="溢价" tickCount={5} tickFormatter={value => isNaN(parseFloat(value)) ? value : `${(parseFloat(value) * 100).toFixed(2)}%`} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="var( --semi-color-tertiary-light-active)" name="次数" />
                    <ReferenceLine x={currentPremiumBin.premium} stroke='var(--semi-color-warning)' label='当前溢价' />
                </BarChart>
            </ResponsiveContainer>
        </Skeleton>






        <Typography.Text >历史溢价</Typography.Text>
        <Skeleton loading={isValidating} placeholder={getLoadingDom()}>
            <ResponsiveContainer width={'100%'} height={300} >
                <BarChart data={lineDataset} height={300} width={500}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickCount={5} tickFormatter={date => format(new Date(date), 'yyyy-MM-dd')} />
                    <YAxis tickFormatter={value => `${(parseFloat(value) * 100).toFixed(2)}%`} />
                    <Tooltip labelFormatter={date => format(new Date(date), 'yyyy-MM-dd')} />
                    <Legend />
                    <Bar dataKey="premium" stroke="var( --semi-color-tertiary-light-active)" name="溢价" />
                    <Brush dataKey="date" height={30} stroke="var( --semi-color-tertiary-hover)" tickFormatter={date => format(new Date(date), 'yyyy-MM-dd')} startIndex={lineDataset?.length ? lineDataset?.length - 60 : 0} />
                    <ReferenceLine y={0} stroke="#000" />
                </BarChart>
            </ResponsiveContainer>
        </Skeleton>



        <Typography.Text >历史表现</Typography.Text>


        <Skeleton loading={isValidating} placeholder={getLoadingDom()}>
            <ResponsiveContainer width={'100%'} height={300} >
                <LineChart data={lineDataset} height={300} width={500}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickCount={5} tickFormatter={date => format(new Date(date), 'yyyy-MM-dd')} />
                    <YAxis />
                    <Tooltip labelFormatter={date => format(new Date(date), 'yyyy-MM-dd')} />
                    <Legend />
                    <Line dataKey="close" stroke="var(--semi-color-tertiary)" dot={false} name="收盘价" />
                    <Line dataKey="netValue" stroke="var(--semi-color-warning)" dot={false} name="净值" />
                    <Brush dataKey="date" height={30} stroke="var( --semi-color-tertiary-hover)" tickFormatter={date => format(new Date(date), 'yyyy-MM-dd')} startIndex={lineDataset?.length ? lineDataset?.length - 60 : 0} />
                </LineChart>
            </ResponsiveContainer>
        </Skeleton>


    </div>
}