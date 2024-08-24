import useSWR from 'swr';
import { client } from '../client';
import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '../../../src/server/router';
import { Collapse, Table, Badge, Space, Typography, Divider, Skeleton } from '@douyinfe/semi-ui';
import { useMemo } from 'react';
import type { ColumnProps } from '@douyinfe/semi-ui/lib/es/table';
import { Link } from 'react-router-dom';

type ETFItem = inferRouterOutputs<AppRouter>['QDIIGrounpedBySector'][0]['etfs'][0];

function ETFTableView({ etfs }: { etfs: ETFItem[] }) {
    const tableData: ColumnProps<ETFItem>[] = [{
        dataIndex: 'name',
        title: 'ETF名称',
        width: 120,
        render: (_, record) =>
            <Link to={`/qdii_detail/${record.code}`} >
                <Typography.Text>{record.name}  </Typography.Text>
                <Typography.Text>{record.code}  </Typography.Text>
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
    return <Table columns={tableData} dataSource={etfs} pagination={false}  />
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
            这种套利策略能在不承担标的资产价格波动风险的情况下,从ETF之间的溢价差异中获利。随着市场效率提高,溢价差异必然收敛,届时平仓即可实现盈利。
        </Typography.Paragraph>
        
    </Typography>
}

export default function QDIIGrounpedBySector() {
    const { data, isValidating } = useSWR('/api/qdii_premium_by_sector', () => client.QDIIGrounpedBySector.query());


    const sortedGp = useMemo(() => data?.sort((a, b) => {
        return b.etfs.length - a.etfs.length
    }), [data])

    if (isValidating) {
        return <Skeleton loading style={{ width: '50vw' }} >
            <Skeleton.Title />
            <Skeleton.Paragraph rows={10} />
        </Skeleton>
    }

    return <div className='page'>
        <Introduction />
        <Divider align="left" margin={'16px'}>QDII ETF 溢价率排名 By Index</Divider>
        <Collapse defaultActiveKey={sortedGp?.[0].index} style={{ width: '100%' }}>
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
    </div>
}