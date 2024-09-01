import { Link, useParams } from 'react-router-dom';
import useSWR from 'swr';
import { client } from '../client';
import { subDays, format } from 'date-fns';
import { Bar, BarChart, Brush, CartesianGrid, Legend, Line, LineChart, ReferenceDot, ReferenceLine, ResponsiveContainer, Scatter, Tooltip, XAxis, YAxis } from 'recharts';
import { Descriptions, Space, Table, Typography } from '@douyinfe/semi-ui';
import { Skeleton } from '@douyinfe/semi-ui';
import { ComponentProps } from 'react';
import type { inferRouterOutputs } from '@trpc/server';
import { AppRouter } from '../../../src/server/router';

type IMyOrder = inferRouterOutputs<AppRouter>['getBacktestingData']['myOrders']
type IMyValue = inferRouterOutputs<AppRouter>['getBacktestingData']['myStats']

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
            render: (v: string) => <Typography.Text type={v.toUpperCase() === 'BUY' ? 'success' : 'warning'}>{v.toUpperCase() === 'BUY' ? '买入' : '卖出'}</Typography.Text>
        },
        {
            dataIndex: 'size',
            title: '数量',
        },
        {
            dataIndex: 'price',
            title: '价格',
            render: (v: string) => {
                return <Typography.Text>{parseFloat(v).toFixed(2)}</Typography.Text>
            }
        }
    ]
    return <Table  dataSource={orders?.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())} columns={columns} pagination={false}/>
}

function renderNetValueChart(lineDataset?: IMyValue) {
    const data = lineDataset?.map(v => ({ datetime: v.datetime, value: (parseFloat(v.value) / 100000).toFixed(2) }))
    return <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} height={300} width={500} >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="datetime" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line dataKey="value" stroke="var(--semi-color-tertiary)" dot={false} name='净值'/>
        </LineChart>
    </ResponsiveContainer>
}

export default function QDIIArbitrary() {
    const { index } = useParams<'index'>()

    const { data, isValidating } = useSWR(index && `/api/qdii_arbitrary/${index}`, () => client.getBacktestingData.query(index as string))


    return <div style={{ padding: '4px 16px 8px 16px', margin: '0 auto', width: '80%' }}>
        <Skeleton loading={isValidating} placeholder={<Skeleton.Paragraph rows={4} />}>
            {renderNetValueChart(data?.myStats)}
            {renderOrdersTable(data?.myOrders)}
        </Skeleton>
    </div>
}