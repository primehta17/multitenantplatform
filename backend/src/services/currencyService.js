import https from 'https';

const fetchRates = (baseCurrency) => {
  return new Promise((resolve, reject) => {
    const url = `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/latest/${baseCurrency}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error('Failed to parse exchange rate response')); }
      });
    }).on('error', reject);
  });
};

export const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) return { amount, currency: toCurrency };
  try {
    const data = await fetchRates(fromCurrency);
    if (data.result !== 'success') throw new Error('Exchange rate API error');
    const rate = data.conversion_rates[toCurrency];
    if (!rate) throw new Error(`No rate found for ${toCurrency}`);
    return { amount: Math.round(amount * rate * 100) / 100, currency: toCurrency };
  } catch (err) {
    console.warn('Currency conversion failed, returning original:', err.message);
    return { amount, currency: fromCurrency };
  }
};
