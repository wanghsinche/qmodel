import useSWR from 'swr';
import { client } from '../client';
import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '../../../src/server/router';
import { Collapse, Table, Badge, Space, Typography, Divider, Skeleton, Button } from '@douyinfe/semi-ui';
import { useMemo } from 'react';
import type { ColumnProps } from '@douyinfe/semi-ui/lib/es/table';
import { Link, useSearchParams } from 'react-router-dom';

type ETFItem = inferRouterOutputs<AppRouter>['QDIIGrounpedBySector'][0]['etfs'][0];

function ETFTableView({ etfs }: { etfs: ETFItem[], loading?: boolean }) {
    const tableData: ColumnProps<ETFItem>[] = [{
        dataIndex: 'name',
        title: 'ETF名称',
        width: 120,
        render: (_, record) =>
            <Link to={`/qdii_detail/${record.code}`} >
                <Typography.Text underline>{record.name}  </Typography.Text>
                <Typography.Text >{record.code}  </Typography.Text>
            </Link>
    }, {
        dataIndex: 'price_dt',
        title: '更新日期',
        width: 120,
        render: (v, record) =>
            <Link to={`/qdii_detail/${record.code}`} >
                <Typography.Text>{v}  </Typography.Text>
            </Link>
    }, {
        dataIndex: 'premium',
        title: '溢价率',
        width: 80,
        render: (v, record) =>
            <Link to={`/qdii_detail/${record.code}`} >
                <Typography.Text>{v}  </Typography.Text>
            </Link>
    }, {
        dataIndex: 'mt_fee',
        title: '管理费',
        width: 80,
        render: (v, record) =>
            <Link to={`/qdii_detail/${record.code}`} >
                <Typography.Text>{v}  </Typography.Text>
            </Link>
    }]
    return <Table columns={tableData} dataSource={etfs} pagination={false} />
}

const Introduction = () => {
    return <Typography style={{ padding: '4px 16px 8px 16px' }}>
        <Typography.Title heading={2}>QDII ETF溢价率排名套利</Typography.Title>

        <Typography.Paragraph>
            QDII溢价套利是一种利用QDII (合格境内机构投资者)ETF之间溢价差异获取收益的有效方法。
        </Typography.Paragraph>
        <Typography.Paragraph>
            其核心原理为:
        </Typography.Paragraph>
        <ul>
            <li>
                识别追踪相似海外标的的QDII ETF
            </li>
            <li>
                买入 <Typography.Text type="success">溢价较低</Typography.Text> 的ETF
            </li>
            <li>
                同时卖出<Typography.Text type="warning">溢价较高</Typography.Text>的ETF
            </li>
        </ul>
        <Typography.Paragraph>
            随着市场效率提高,溢价差异必然收敛,届时平仓即可实现盈利。由于A股市场无法直接做空,这种套利策略需要一直持有仓位,因此是一种跑赢目标指数的alpha策略.
        </Typography.Paragraph>

    </Typography>
}

export default function QDIIGrounpedBySector() {
    const [query, setQuery] = useSearchParams();

    const { data, isValidating } = useSWR('/api/qdii_premium_by_sector', () => client.QDIIGrounpedBySector.query());


    const sortedGp = useMemo(() => data?.sort((a, b) => {
        return b.etfs.length - a.etfs.length
    }), [data])

    const activeKeys = query.getAll('index')

    return <div className='page'>
        <Introduction />
        <Space  style={{width: '100%', justifyContent: 'center'}}>
            <Link to={'/qdii_arbitrary/nasdaq100'}><Button type="primary" size='large'>查看策略表现</Button></Link>
        </Space>
        <Divider align="left" margin={'16px'}>QDII ETF 溢价率排名</Divider>
        <Skeleton placeholder={
            <Skeleton.Paragraph rows={10} style={{ width: '100%' }} />
        } loading={isValidating}>
            <Collapse defaultActiveKey={sortedGp?.[0].index} style={{ width: '100%' }} activeKey={activeKeys.length > 0 ? activeKeys : void 0} onChange={key => {
                setQuery({ index: key as string[] })
            }}>
                {
                    // print the data
                    sortedGp?.map((group) => {
                        return <Collapse.Panel itemKey={group.index} key={group.index} header={<Space>{group.index} <Badge count={group.etfs.length} countStyle={{ backgroundColor: '#aaa' }} /></Space>}>
                            {/* <h2>{group.index}</h2> */}
                            <ETFTableView etfs={group.etfs} />
                        </Collapse.Panel>
                    })
                }
            </Collapse>
        </Skeleton>
    </div>
}