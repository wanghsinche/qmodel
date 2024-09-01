import { Link, useParams } from 'react-router-dom';
import useSWR from 'swr';
import { client } from '../client';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Divider, Table, Typography } from '@douyinfe/semi-ui';
import { Skeleton } from '@douyinfe/semi-ui';
import type { inferRouterOutputs } from '@trpc/server';
import { AppRouter } from '../../../src/server/router';

type IMyOrder = inferRouterOutputs<AppRouter>['getBacktestingData']['myOrders']
type IMyValue = inferRouterOutputs<AppRouter>['getBacktestingData']['myStats']

const Introduction = () => {
    return <Typography style={{ padding: '4px 16px 8px 16px' }}>
        {/* <Typography.Title heading={2}>QDII ETF套利历史表现</Typography.Title> */}
        <Typography.Paragraph>
            回测周期为过去一年，数据仅供参考，不作为投资决策依据。
        </Typography.Paragraph>
        <ul>
            <li>
                根据历史溢价,动量,分位等因子,计算每只QDII ETF的溢价得分
            </li>
            <li>
                买入 <Typography.Text type="success">得分最低</Typography.Text> 的ETF
            </li>
            <li>
                卖出<Typography.Text type="warning">得分超过阈值</Typography.Text>的ETF
            </li>
        </ul>
    </Typography>
}


function renderOrdersTable(orders?: IMyOrder) {
    const columns = [
        {
            dataIndex: 'datetime',
            title: '日期',
        },
        {
            dataIndex: 'code',
            title: '代码',
        },
        {
            dataIndex: 'direction',
            title: '方向',
            width: 60,
            render: (v: string) => <Typography.Text type={v.toUpperCase() === 'BUY' ? 'success' : 'warning'}>{v.toUpperCase() === 'BUY' ? '买入' : '卖出'}</Typography.Text>
        },
        // {
        //     dataIndex: 'size',
        //     title: '数量',
        // },
        {
            dataIndex: 'price',
            title: '价格',
            render: (v: string) => {
                return <Typography.Text>{parseFloat(v).toFixed(2)}</Typography.Text>
            }
        }
    ]
    return <Table dataSource={orders?.sort((a: Record<string, string>, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())} columns={columns} pagination={false} />
}

function LatestOrder({ orders }: { orders?: IMyOrder }) {
    const latest = orders?.reduce((a, b) => new Date(a.datetime) > new Date(b.datetime) ? a : b)
    const direction = latest?.direction.toUpperCase() === 'BUY' ? ' 买入 ' : ' 卖出 '

    const code = latest?.code.split('.')[0] || ''

    const { data: profile } = useSWR(latest && ['profile', latest.code], async () => client.getQDIIProfile.query(code))


    return <Typography style={{ padding: '4px 16px 8px 16px', wordBreak: 'break-all' }}>
        <Typography.Text >最新交易 : </Typography.Text>
        <br />
        <Typography.Text >
            {latest?.datetime}
        </Typography.Text>
        <Typography.Text type={latest?.direction.toUpperCase() === 'BUY' ? 'success' : 'warning'}>{direction}</Typography.Text>
        <Link to={`/qdii_detail/${latest?.code}`}><Typography.Text underline style={{ color: 'var( --semi-color-text-2)' }} >
            {profile?.name}
        </Typography.Text></Link>
        <br />
        <Typography.Text >价格 : </Typography.Text>
        <Typography.Text >{parseFloat(latest?.price || '').toFixed(2)}</Typography.Text>
    </Typography>

}

function renderNetValueChart(lineDataset?: IMyValue, _orders?: IMyOrder) {
    const data = lineDataset?.map(v => ({ datetime: v.datetime, value: ((parseFloat(v.value) - 100000) / 100000).toFixed(2) }))

    return <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} height={300} width={500} >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="datetime" type='category' />
            <YAxis  />
            <Tooltip />
            <Legend />
            <Line dataKey="value" stroke="var(--semi-color-tertiary)" dot={false} name='策略收益' />
        </LineChart>
    </ResponsiveContainer>
}

export default function QDIIArbitrary() {
    const { index } = useParams<'index'>()

    const { data, isValidating } = useSWR(index && `/api/qdii_arbitrary/${index}`, () => client.getBacktestingData.query(index as string), {
        revalidateOnFocus: false
    })


    return <div style={{ padding: '4px 4px 8px 4px', margin: '0 auto', width: '90%' }}>
        <Skeleton loading={isValidating} placeholder={<Skeleton.Paragraph rows={4} />}>
            <Introduction />
            <LatestOrder orders={data?.myOrders} />
            {renderNetValueChart(data?.myStats, data?.myOrders)}
            <Divider align="left" margin={'16px'}>交易点明细</Divider>
            {renderOrdersTable(data?.myOrders)}
        </Skeleton>
    </div>
}