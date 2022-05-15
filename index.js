/**
 * Author: Jawad Shuaib 2022
 * API for getting stock data from Yahoo Finance
 * 
 * GCF Documentation: https://cloud.google.com/functions/docs/functions-framework?_ga=2.170494504.-906433436.1652622998  
 */

/**
 * Usage: 
 * individual stock information: /stock?stock=msft
 * list of stocks information: /stock?stocks=msft,aapl
 * ETF holdings: /stock?stock=arkk
 * Check if stock is an ETF: /stock?stock=arkk&isETF=true
 */

const cheerio = require('cheerio');
const axios = require ('axios');  

exports.index = (req, res) => {
  switch (req.path) {
    case '/stock':
      return stock(req, res)
    case '/stocks':
      return stocks(req, res)
    case '/etf':
      return etf(req, res)
      case '/is_etf':
        return is_etf(req, res)      
    default:
      res.send('function not defined')
  }
}

const baseURL = `https://finance.yahoo.com`;

/**
* API for individual stocks
* req ?stock=TSLA
* result {"TSLA":769.59}}
*/
const stock = async (req, res) => {  
  
  if (!req.query.stock) {
    return res.status(200).send({
      message: 'You must provide a stock symbol'
    });
  }

  let stock = req.query.stock;
  const url = `${baseURL}/quote/${stock}/history?p=${stock}`;

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const prices = $('tr td:nth-child(6)').get().map(elem => $(elem).text());

    if (prices.length === 0) {
      res.status(400).send({
        message: 'No stock data found'
      });
    } else {
      res.status(200).send ({
        [stock]: prices
      });
    }
    
  } catch (err) {
    res.status(500).send({
      message: err.message
    });
  }

};

/**
* API for getting a list of stocks
* req ?stocks=TSLA,ROKU
* result {"results":[{"TSLA":{"percentage-change":"+5.71%","last-price":"769.59"}},{"ROKU":{"percentage-change":"+11.82%","last-price":"97.84"}}]}
*/
const stocks = async (req, res) => {

  if (!req.query.stocks) {
    return res.status(200).send({
      message: 'You must provide a stock symbol'
    });
  }

  const stocks = req.query.stocks;
  const url = `${baseURL}/quotes/${stocks}/view/v1`;

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const lastPrices = $('tr td:nth-child(2)').get().map(elem => $(elem).text());
    const percentageChanges = $('tr td:nth-child(4)').get().map(elem => $(elem).text());

    if (percentageChanges.length === 0) {
      res.status(400).send({
        message: 'No stock data found'
      });
    } else {
      
      const results = stocks.split(",").map ((stock, index) => {        
          return { 
            [stock]: {
              'last-price': lastPrices[index],
              'percentage-change': percentageChanges[index]               
            }
          };
      });
      
      res.status(200).send ({
        results
      });      
    }
  } catch (err) {
    res.status(500).send({
      message: err.message
    });
  }

};

/**
 * API for getting ETF holdings
 * Provides a list of top 10 ETF holdings
 * @param req ?stock=ARKK 
 * @returns {"holdings":{"etf":"ARKK","companies":[{"Tesla Inc":{"symbol":"TSLA","percentage-assets":"9.56%"}},{"Roku Inc Class A":{"symbol":"ROKU","percentage-assets":"6.48%"}},{"Teladoc Health Inc":{"symbol":"TDOC","percentage-assets":"5.76%"}},{"Square Inc A":{"symbol":"SQ","percentage-assets":"4.37%"}},{"Zoom Video Communications Inc":{"symbol":"ZM","percentage-assets":"4.36%"}},{"Shopify Inc A":{"symbol":"SHOP.TO","percentage-assets":"4.27%"}},{"Spotify Technology SA":{"symbol":"SPOT","percentage-assets":"3.68%"}},{"Twilio Inc A":{"symbol":"TWLO","percentage-assets":"3.66%"}},{"Coinbase Global Inc Ordinary Shares - Class A":{"symbol":"COIN","percentage-assets":"3.65%"}},{"Unity Software Inc Ordinary Shares":{"symbol":"U","percentage-assets":"3.41%"}}]}}
 */
 const etf = async (req, res) => {  

  if (!req.query.stock) {
    return res.status(200).send({
      message: 'You must provide a stock symbol for the ETF'
    });
  }

  const etf = req.query.stock;
  const url = `${baseURL}/quote/${etf}/holdings?p=${etf}`;

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data); 

    const names = $('div:nth-child(4) tbody tr td:nth-child(1)').get().map(elem => $(elem).text());
    const symbols = $('div:nth-child(4) tbody tr td:nth-child(2)').get().map(elem => $(elem).text());
    const percentageAssets = $('div:nth-child(4) tbody tr td:nth-child(3)').get().map(elem => $(elem).text());

    if (names.length === 0) {
      res.status(400).send({
        message: 'No holdings for this symbol found. Are you sure this is an ETF?'
      });
    } else {
      
      const companies = names.map ((name, index) => {        
          return { 
            [name]: { 
              'symbol': symbols[index],
              'percentage-assets': percentageAssets[index]
            }
          };
      });
            
      res.status(200).send ({
        'holdings' : {
          'etf': etf,
          'companies': companies        
        }        
      });      
    }
  } catch (err) {
    res.status(500).send({
      message: err.message
    });
  }
};

/**
 * API to check if this is an ETF
 * @param req ?stock=ARKK 
 * @returns {"symbol":"ARKK","is-etf":true}
 */
 const is_etf = async (req, res) => {
  
  if (!req.query.stock) {
    return res.status(200).send({
      message: 'You must provide a stock symbol to check if it is an ETF'
    });
  }

  const stock = req.query.stock;
  const url = `${baseURL}/quote/${stock}?p=${stock}`;

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);     

    const span = $('div[id="quote-nav"] ul li:nth-child(7) a span').text().trim();    
    
    let isETF = false;
    if (span === 'Holdings') {
      isETF = true;
    }

    res.status(200).send ({
      'symbol': stock,
      'is-etf': isETF
    });                    
  } catch (err) {
    res.status(500).send({
      message: err.message
    });
  }

};