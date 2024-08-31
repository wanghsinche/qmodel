import backtrader as bt
import numpy as np
from scipy.stats import percentileofscore

class QDIIPremiumIndicator(bt.Indicator):
    lines = ('score', 'premium', 'relative_premium', 'historical_percentile', 'absolute_threshold', 'premium_momentum', 'profit_rate')
    params = (
        ('period', 20),
        ('threshold', 0.05),
        ('target_profit', 0.05),
    )
    plotlines = dict(
        score=dict(_name='Score', color='blue'),
        premium=dict(_name='Premium', _method='bar', alpha=0.50, width=1.0),
        relative_premium=dict(_name='Relative Premium', color='green', _plotskip=True, subplot=False),
        historical_percentile=dict(_name='Historical Percentile', color='orange', _plotskip=True, subplot=False),
        absolute_threshold=dict(_name='Absolute Threshold', color='red', _plotskip=True, subplot=False),
        premium_momentum=dict(_name='Premium Momentum', color='purple', _plotskip=True, subplot=False),
        profit_rate=dict(_name='Profit Rate', color='brown', _plotskip=True, subplot=False)
    )

    def __init__(self):
        self.addminperiod(self.p.period)
        
        # 使用真实的净值和价格数据计算溢价率
        self.premium = (self.data.close - self.data.nav) / self.data.nav
        
        # 相对溢价率
        self.avg_premium = bt.indicators.SMA(self.premium, period=self.p.period)
        self.std_premium = bt.indicators.StdDev(self.premium, period=self.p.period)
        
        # 溢价动量指标
        self.short_ma = bt.indicators.SMA(self.premium, period=5)
        self.long_ma = bt.indicators.SMA(self.premium, period=20)

    def next(self):
        # 0. 溢价率
        self.lines.premium[0] = self.premium[0]
        # 1. 相对溢价率
        if self.std_premium[0] != 0:
            z_score = (self.premium[0] - self.avg_premium[0]) / self.std_premium[0]
            self.lines.relative_premium[0] = min(max(z_score / 2, 0), 1)
        else:
            self.lines.relative_premium[0] = 0

        # 2. 历史溢价百分位
        historical_premiums = self.premium.get(size=self.p.period)
        self.lines.historical_percentile[0] = percentileofscore(historical_premiums, self.premium[0]) / 100

        # 3. 绝对溢价阈值
        self.lines.absolute_threshold[0] = min(self.premium[0] / self.p.threshold, 1)

        # 4. 溢价动量指标
        premium_diff = self.short_ma[0] - self.long_ma[0]
        max_diff = max(historical_premiums) - min(historical_premiums)
        self.lines.premium_momentum[0] = min(max(premium_diff / max_diff if max_diff != 0 else 0, 0), 1)

        # 5. 套利收益率
        if len(self) > 1:  # 确保有前一天的数据
            buy_price = self.data.close[-1]
            current_price = self.data.close[0]
            profit_rate = (current_price - buy_price) / buy_price
            self.lines.profit_rate[0] = min(profit_rate / self.p.target_profit, 1)
        else:
            self.lines.profit_rate[0] = 0

        # 计算综合得分
        self.lines.score[0] = (
            # self.lines.relative_premium[0] * 0.3 +
            self.lines.historical_percentile[0] * 0.4 +
            self.lines.absolute_threshold[0] * 0.3 +
            self.lines.premium_momentum[0] * 0.3 
            # self.lines.profit_rate[0] * 0.2
        )



class QDIIETFStrategy(bt.Strategy):
    params = (
        ('score_threshold', 0.6),
        ('volumn_threshold', 1000000)
    )

    def __init__(self):
        self.premium_indicators = [QDIIPremiumIndicator(i) for i in self.datas]

    def start(self):
        print('start')
        self.mystats = open('mystats.csv', 'w')
        self.mystats.write('datetime,value\n')
        self.myorders = open('myorders.csv', 'w')
        self.myorders.write('datetime,code,direction,size,price,commission\n')

    def stop(self):
        print('stop')
        self.mystats.close()
        self.myorders.close()

    def log(self, txt, dt=None):
        ''' Logging function fot this strategy'''
        dt = dt or self.datas[0].datetime.date(0)
        print('%s, %s' % (dt.isoformat(), txt))
    
    def notify_order(self, order):
        if order.status in [order.Submitted, order.Accepted]:
            # Buy/Sell order submitted/accepted to/by broker - Nothing to do
            return

        # Check if an order has been completed
        # Attention: broker could reject order if not enough cash
        if order.status in [order.Completed]:
            if order.isbuy():
                self.log(
                    'BUY EXECUTED, Price: %.2f, Cost: %.2f, Comm %.2f' %
                    (order.executed.price,
                     order.executed.value,
                     order.executed.comm))

                self.buyprice = order.executed.price
                self.buycomm = order.executed.comm
            else:  # Sell
                self.log('SELL EXECUTED, Price: %.2f, Cost: %.2f, Comm %.2f' %
                         (order.executed.price,
                          order.executed.value,
                          order.executed.comm))
            ordtype = 'BUY' if order.isbuy() else 'SELL' if order.issell() else 'OTHERS'

            self.myorders.write(f'{self.datas[0].datetime.date(0).isoformat()},{order.data._name},{ordtype},{order.size},{order.executed.price},{order.executed.comm}\n')

            self.bar_executed = len(self)

        elif order.status in [order.Canceled, order.Margin, order.Rejected]:
            self.log(f'Order Canceled/Margin/Rejected: ${[order.Canceled, order.Margin, order.Rejected]}')
            self.log('Order Status: %s' % order.status)
        
        self.order = None

    def notify_trade(self, trade):
        if not trade.isclosed:
            return

        self.log('OPERATION PROFIT, GROSS %.2f, NET %.2f' %
                 (trade.pnl, trade.pnlcomm))


    def all_in(self, data, score):
        # Buy all available cash
        # Calculate size, floor the size to the nearest integer
        size = (self.broker.getcash() / data.close[0]) * 0.99 # 计算买入的数量
        size = int(size / 100) * 100  # 将数量转换为整数，并且只能是100的倍数
        if size > 0:
            print(f'size {size}')
            print(f'data {data._name} @ {score}')
            return self.buy(data=data, size=size)  # Place the buy order


    def next(self):

        # 找到position 对应的score
        for i, data in enumerate(self.datas):
            premium_indicator = self.premium_indicators[i]
            if premium_indicator.score[0] > self.p.score_threshold:
                pos = self.getposition(data)
                if pos.size > 0:
                    self.close(data=data)
                    

        # 判断当前是否有position，没有就买入
        hasPosition = False
        for data in self.datas:
            pos = self.getposition(data)
            if pos.size > 0:
                hasPosition = True
                break

        if not hasPosition:
            # 挑选volumn大于volumn_threshold的etf, 卖入分数最低的ETF
            scores = []
            applicables = []
            for i, data in enumerate(self.datas):
                if data.volume[0] < self.p.volumn_threshold:
                    continue
                applicables.append(data)
                premium_indicator = self.premium_indicators[i]
                scores.append(premium_indicator.score[0])
            # 找到分数最低的etf
            lowest_score_index = np.argmin(scores)
            lowest_score_etf = applicables[lowest_score_index]
            self.all_in(data=lowest_score_etf, score=min(scores))


        self.mystats.write(f'{self.datas[0].datetime.date(0).isoformat()},{self.broker.getvalue()}\n')

