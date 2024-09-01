# %%
import backtrader
import pandas as pd
import yfinance
import utils.eft_netval as etf_netval
from utils.premium_strategy import QDIIETFStrategy
import datetime
import matplotlib
matplotlib.use('agg')
import matplotlib.pyplot as plt

# %%
# Get the current date
today = datetime.date.today()
# Format the date in different ways
end_date = today.strftime('%Y-%m-%d')  # Output: '2024-08-31'

one_year_ago = today.replace(year=today.year - 1)

start_date = one_year_ago.strftime('%Y-%m-%d')  # Output: '2024-08-31'


# %%
# 读取qdii list
etf_netval.get_qdii_list()
qdii_list = pd.read_csv('qdii_list.csv')
qdii_code = [str(i) for i in qdii_list[qdii_list['index_nm']=='纳斯达克100']['fund_id']]
qdii_code_with_market = [
    i+'.sz' if i.startswith('1') else i+'.ss' for i in qdii_code
]
qdii_code_with_market = [i for i in qdii_code_with_market if not i.startswith('16')]

print(f'all the qdii codes: {qdii_code}')
print(f'qdii code with market: {qdii_code_with_market}')

# %%
# download the net value
for code in qdii_code:
    etf_netval.download_data(code)

# %%
# download the price from yahoo
qdii_code_with_market = [i for i in qdii_code_with_market if not i.startswith('16')]
df = yfinance.download(qdii_code_with_market, start=start_date, end=end_date, group_by='ticker')
df.to_pickle('./qdii_price.pkl')

# %%
# map netValue to price
combined_df_dist = dict()


for rawcode in qdii_code_with_market:
    code = rawcode.upper()
    code_witout_market = code.split('.')[0]
    net_df = pd.read_csv(f'./{code_witout_market}.netvalue.csv')
    net_df['date'] = pd.to_datetime(net_df['date'], utc=True)
    net_df.set_index('date', inplace=True)
    net_df.sort_index(inplace=True)
    price_df = df[code]
    price_df.index = pd.to_datetime(price_df.index,  utc=True)
    price_df.sort_index(inplace=True)
    # combine the two dataframes by inner join
    combined_df = pd.merge(price_df, net_df,  left_index=True,  how='inner',  right_index=True)
    combined_df_dist[code] = combined_df






class MyPandasData(backtrader.feeds.PandasData):
    lines = ('nav',)
    params = (
        ('datetime', -1),
        ('open', -1),
        ('high', -1),
        ('low', -1),
        ('close', -1),
        ('volume', -1),
        ('nav', -1),
    )



my_ruuner = backtrader.Cerebro(stdstats=True)

my_ruuner.broker.setcash(100000.0)
my_ruuner.broker.setcommission(commission=0.001)

# 添加数据
counter = 0
best_ratio = 0
wrost_ratio = 99

for code, df in combined_df_dist.items():
    counter += 1
    has_nan = df.isna().any().any()
    if has_nan:
        print(f'{code} has nan, and dropped')
        continue
    df.index = pd.to_datetime(df.index, utc=True)
    data = MyPandasData(dataname=df, name=code)
    my_ruuner.adddata(data)

# 添加策略
my_ruuner.addstrategy(QDIIETFStrategy)

my_ruuner.addanalyzer(backtrader.analyzers.SharpeRatio, _name='sharpe')
my_ruuner.addanalyzer(backtrader.analyzers.TradeAnalyzer, _name='trades')
my_ruuner.addanalyzer(backtrader.analyzers.Returns, _name='returns')


# 运行
results = my_ruuner.run()


matplotlib.rcParams['figure.figsize'] = (16, len(my_ruuner.datas)*4+8)
# set the dpi
matplotlib.rcParams['figure.dpi'] = 300

fig = my_ruuner.plot()
plt.savefig('./result.png')

strategy = results[0]


# Access the performance analyzers
sharpe_ratio = strategy.analyzers.sharpe.get_analysis()['sharperatio']
trade_analyzer = strategy.analyzers.trades.get_analysis()
returns = strategy.analyzers.returns.get_analysis()

with open('other_stats.csv', 'w') as other_stats:
    other_stats.write(f"""Item, Value
Data, {start_date} - {end_date}
Sharpe Ratio, {round(sharpe_ratio, 2)}
Total Trades, total {trade_analyzer['total']['total']} open {trade_analyzer['total']['open']} closed {trade_analyzer['total']['closed']}
Total Returns, {round(returns['rtot'] * 100, 2)}%
Ratio among all, {round((best_ratio - 1) * 100, 2)} , {round((wrost_ratio - 1) * 100, 2)}
""")


# %%
