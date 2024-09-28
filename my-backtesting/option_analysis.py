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
import numpy as np

start_date = datetime.date.today().replace(year=datetime.date.today().year - 1).strftime('%Y-%m-%d')
end_date = datetime.date.today().strftime('%Y-%m-%d')

code = 'PLTR'

# %%
# download the price from yahoo
df = yfinance.download(code, start=start_date, end=end_date, group_by='ticker')

# %%
print(df)

# %%
# get the Volatility rate of the last 30 days
# Volatility is a statistical measure of the dispersion of data around its mean over a certain period of time. It is calculated as the standard deviation multiplied by the square root of the number of time periods, T. In finance, it represents this dispersion of market prices, on an annualized basis.
ndays = 30

df['Historical Volatility'] = df['Close'].pct_change().rolling(window=ndays).std() * np.sqrt(ndays)

print(df)



# %%
import pandas as pd
import numpy as np
import yfinance as yf
from datetime import datetime, timedelta

ticker = 'nio'  # Replace with your desired stock ticker


def get_historical_data(ticker, start_date, end_date):
    return yf.download(ticker, start=start_date, end=end_date)

def estimate_future_volatility(data, forecast_window):
    returns = np.log(data['Close'] / data['Close'].shift(1))
    recent_volatility = returns.tail(forecast_window).std() * np.sqrt(252)
    return recent_volatility

def analyze_volatility(ticker, forecast_windows):
    end_date = datetime.now()
    start_date = end_date - timedelta(days=max(forecast_windows) + 30)  # Add extra days for calculation

    # Fetch historical data
    data = get_historical_data(ticker, start_date, end_date)

    # Calculate volatility estimates
    results = {}
    for window in forecast_windows:
        volatility = estimate_future_volatility(data, window)
        results[f'{window}-day Estimated Volatility'] = volatility

    return results

def analyze_volatility_single(ticker, forecast_window, end_date):
    # end_date = datetime.now()
    start_date = end_date - timedelta(days=forecast_window + 30)  # Add extra days for calculation

    # Fetch historical data
    data = get_historical_data(ticker, start_date, end_date)

    # Calculate volatility estimates
    return estimate_future_volatility(data, forecast_window)


def print_analysis(ticker, results):
    print(f"\nVolatility Analysis for {ticker}:")
    for key, value in results.items():
        print(f"{key}: {value:.2%}")
    
    print("\nInterpretation:")
    for key, value in results.items():
        if value < 0.20:
            print(f"{key}: Low volatility expected")
        elif 0.20 <= value < 0.30:
            print(f"{key}: Moderate volatility expected")
        else:
            print(f"{key}: High volatility expected")
    
    print("\nLimitations:")
    print("- This estimate assumes recent volatility will persist.")
    print("- It doesn't account for future events or market expectations.")
    print("- Actual future volatility may differ significantly.")

# Example usage



forecast_windows = [30, 60, 90]  # Forecast windows in days

results = analyze_volatility(ticker, forecast_windows)
print_analysis(ticker, results)

def get_current_implied_volatility(ticker):
    stock = yf.Ticker(ticker)
    print(ticker)
    options = stock.options
    if len(options) > 0:
        # get the impliedVolatility of all dates
        # option_data = stock.option_chain(options[0])
        # return option_data.calls['impliedVolatility'].mean()
        current_underlying_ask = stock.info['ask']
        print(f"Current Underlying ask: {current_underlying_ask}")
        results = []
        for date in options:
            option_data = stock.option_chain(date)  
            # find the option with the nearest price to the current ask
            current_ask = current_underlying_ask
            nearest_ask = np.abs(option_data.calls['strike'] - current_ask).idxmin()
            corresponding_call = option_data.calls.loc[nearest_ask]
            nearest_ask = np.abs(option_data.puts['strike'] - current_ask).idxmin()
            corresponding_put = option_data.puts.loc[nearest_ask]

            res = dict()
            res['Date'] = date
            res['Call IV'] = f"{(corresponding_call['impliedVolatility']*100).round(2)}%"
            res['Put IV'] = f"{(corresponding_put['impliedVolatility']*100).round(2)}%"
            res['Call Price'] = corresponding_call['ask']
            res['Put Price'] = corresponding_put['ask']
            res['Call Strike'] = corresponding_call['strike']
            res['Put Strike'] = corresponding_put['strike']
            res['Call Profitable Chg'] = f"{(res['Call Price'] / res['Call Strike'] * 100).round(2)}%"
            res['Put Profitable Chg'] = f"{(res['Put Price'] / res['Put Strike']*100).round(2)}%"
            
            res['Total Profitable Chg'] = f"{((res['Call Price'] + res['Put Price']) / (res['Call Strike'] + res['Put Strike']) * 2 * 100).round(2)}%"

            # Convert the string to a datetime object
            date_object = datetime.strptime(date, "%Y-%m-%d")

            res['Expiration'] = (date_object - datetime.now()).days

            res['Anunal Rate'] = f"{round(float(res['Total Profitable Chg'].strip('%')) / res['Expiration'] * 365, 2)}%"

            results.append(res)

            # print(f"Date: {date}, Call IV: {mean_call_implied_volatility} Put IV: {mean_put_implied_volatility}") 
        sorted_results = sorted(results, key=lambda x: (float(x['Call IV'].strip('%'))+float(x['Put IV'].strip('%'))), reverse=False)

        return pd.DataFrame(sorted_results)
    
    return None
get_current_implied_volatility(ticker)
# %%
import pandas as pd
import datetime

# Define the start and end dates
start_date = datetime.date.today().replace(year=datetime.date.today().year - 1).strftime('%Y-%m-%d')
end_date = datetime.date.today().strftime('%Y-%m-%d')
results = pd.DataFrame(pd.date_range(start_date, end_date))
results.rename(columns={0: 'Date'}, inplace=True)
results.set_index('Date', inplace=True)
results['Date'] = results.index.strftime('%Y-%m-%d')


results
# %%
