# %%
import urllib.request
import pandas as pd
import json

# %%
# 下载数据
def download_data(code):
    url = f'https://stockjs.finance.qq.com/fundUnitNavAll/data/year_all/{code}.js'
    response = urllib.request.urlopen(url)
    data = response.read().decode('utf-8')


    # find out the index of first { and replace all before
    data = data.replace(data[:data.find('{')], '')
    json.loads(data)
    jsonData = json.loads(data)
    df = pd.DataFrame(jsonData['data'], columns=['date', 'nav', 'accumulated value'])

    df['date'] = pd.to_datetime(df['date'])
    df.set_index('date', inplace=True)
    df.to_csv(f'./{code}.netvalue.csv')
    return data


# %%
# 下载QDII List
def get_qdii_list():
    url = 'https://www.jisilu.cn/data/qdii/qdii_list/E?___jsl=LST___t=1723376893136&rp=22&page=1'
    response = urllib.request.urlopen(url)
    data = response.read().decode('utf-8')
    jsonData = json.loads(data)
    df = pd.DataFrame([ node['cell'] for node in jsonData['rows'] ])
    df.set_index('fund_id', inplace=True)
    df.to_csv('./qdii_list.csv')
    return df
