// sum.test.js
import { describe, expect, test } from 'vitest'
import { getBacktestingData } from './index'

describe('getBacktestingData', () => {
    test('should get backtesting data', async () => {
        const data = await getBacktestingData('nasdaq100');
        expect(data?.myOrders?.length).toBeGreaterThan(0);
        expect(data?.otherStats?.length).toBeGreaterThan(0);
        expect(data?.myStats?.length).toBeGreaterThan(0);
        console.info(data?.otherStats)
    })
})