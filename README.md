# Yahoo Finance API for Serverless Computing

These node functions can be used to create a custom API for accessing yahoo finance data. The code can be deployed on Google Cloud Functions or run locally.

The API can be used to access data for individual stocks, a list of stocks, ETF holdings, or to check if a particular stock symbol is a stock or ETF

- Usage:
- individual stock information: /stock?stock=msft
- list of stocks information: /stock?stocks=msft,aapl
- ETF holdings: /stock?stock=arkk
- Check if stock is an ETF: /stock?stock=arkk&isETF=true

To run on the local machine, simply use npm start
To deploy on Google Cloud Functions, either login into https://cloud.google.com/functions or upload code using their CLI (see: https://cloud.google.com/functions/docs/functions-framework?_ga=2.170494504.-906433436.1652622998)
