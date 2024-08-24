import { useParams } from 'react-router-dom';
import useSWR from 'swr';
import { client } from '../client';
import { subDays, format } from 'date-fns';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Typography } from '@douyinfe/semi-ui';
import { Skeleton } from '@douyinfe/semi-ui';

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
    });

    if (isValidating) {
        return <Skeleton placeholder={
            <>
                <Skeleton.Paragraph rows={1} />
                <Skeleton.Image style={{ width: '50vw', height: '30vw', margin: '10px auto' }} />
                <Skeleton.Paragraph rows={1} />
                <Skeleton.Image style={{ width:'50vw', height: '30vw', margin: '10px auto' }} />
            </>
        } style={{ width: '100vw' }} loading={true}></Skeleton>

    }

    const histogramDataset = calculateHistogram(data?.map(item => item.premium) as number[], 0.001).map(item => ({ premium: item.binStart, count: item.count }))

    const lineDataset = data?.map(item => ({ date: item.date, premium: item.premium })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())


    const currentPremium = lineDataset?.[lineDataset.length - 1].premium
    const latestDate = lineDataset?.[lineDataset.length - 1].date
    const latestFormattedDate = latestDate && format(latestDate, 'yyyy-MM-dd')

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


    return <div style={{ padding:'4px 16px 8px 16px' }}>
        <Typography.Title heading={2}>QDII 代码: {code}</Typography.Title>

        <Typography.Paragraph>当前溢价: {currentPremium}</Typography.Paragraph>
        <Typography.Paragraph>数据更新日期: {latestFormattedDate}</Typography.Paragraph>


        <Typography.Title heading={3}>历史溢价</Typography.Title>
        <ResponsiveContainer aspect={5/3}>
            <LineChart  data={lineDataset} height={300} width={500}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickCount={5} tickFormatter={date => format(new Date(date), 'yyyy-MM-dd')} />
                <YAxis />
                <Tooltip labelFormatter={date => format(new Date(date), 'yyyy-MM-dd')} />
                <Legend />
                <Line dataKey="premium" stroke="var( --semi-color-tertiary-active)" dot={false} />
            </LineChart>

        </ResponsiveContainer>

        <Typography.Title heading={3}>溢价直方图</Typography.Title>
        <ResponsiveContainer aspect={5/3}>
            <BarChart data={histogramDataset} height={300} width={500} >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="premium" tickCount={5} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="var( --semi-color-tertiary-active)" />
                {/* mark the current data */}

                <ReferenceLine x={currentPremiumBin.premium} stroke='var(--semi-color-warning)' label='当前溢价' />

            </BarChart>
            </ResponsiveContainer>
    </div>
}