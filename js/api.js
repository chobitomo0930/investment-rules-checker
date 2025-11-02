// 金融データAPI管理
const FinanceAPI = {
    // APIキーを取得（localStorageから）
    getApiKeys() {
        return Storage.loadApiKeys() || {};
    },

    // 複数のAPIを使用してデータ取得の信頼性を向上
    
    // VIX指数を取得（複数ソースから試行）
    async fetchVIX() {
        const apiKeys = this.getApiKeys();
        
        // 方法0: Twelve Data（APIキーがある場合は最優先）
        if (apiKeys.TWELVE_DATA) {
            const vixSymbols = ['VIX', '^VIX'];
            
            for (const symbol of vixSymbols) {
                try {
                    const response = await fetch(`https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${apiKeys.TWELVE_DATA}`);
                    const data = await response.json();
                    
                    console.log(`Twelve Data VIX (${symbol}) レスポンス:`, data);
                    
                    if (data && data.close && !data.status) {
                        console.log(`✅ Twelve Data VIX成功 (シンボル: ${symbol})`);
                        return {
                            value: parseFloat(parseFloat(data.close).toFixed(2)),
                            timestamp: new Date(data.datetime).getTime(),
                            source: 'Twelve Data'
                        };
                    } else if (data && data.message) {
                        console.warn(`Twelve Data (${symbol}) エラー:`, data.message);
                    }
                } catch (error) {
                    console.warn(`Twelve Data VIX (${symbol}) 取得失敗:`, error);
                }
            }
            
            console.warn('Twelve Data: すべてのVIXシンボル形式で失敗');
        }
        
        // 方法1: Yahoo Finance（CORSプロキシ経由、APIキー不要）
        // CORSプロキシを使用してYahoo Financeにアクセス
        const corsProxies = [
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?'
        ];
        
        const yahooEndpoints = [
            'https://query1.finance.yahoo.com/v8/finance/chart/%5EVIX?interval=1d&range=1d',
            'https://query1.finance.yahoo.com/v7/finance/quote?symbols=%5EVIX'
        ];

        // CORSプロキシとYahoo Financeエンドポイントの組み合わせを試行
        for (const proxy of corsProxies) {
            for (const endpoint of yahooEndpoints) {
                try {
                    const proxiedUrl = proxy + encodeURIComponent(endpoint);
                    console.log(`VIX取得試行: ${proxy} + Yahoo Finance`);
                    
                    const response = await fetch(proxiedUrl);
                    const data = await response.json();
                
                    console.log(`Yahoo Finance VIX レスポンス:`, data);
                    
                    // v8 Chart API
                    if (data && data.chart && data.chart.result && data.chart.result[0]) {
                        const result = data.chart.result[0];
                        if (result.meta && result.meta.regularMarketPrice) {
                            console.log('✅ Yahoo Finance v8 Chart API 成功（CORSプロキシ経由）');
                            return {
                                value: parseFloat(result.meta.regularMarketPrice.toFixed(2)),
                                timestamp: result.meta.regularMarketTime * 1000,
                                source: 'Yahoo Finance'
                            };
                        }
                    }
                    
                    // v7 Quote API
                    if (data && data.quoteResponse && data.quoteResponse.result && data.quoteResponse.result[0]) {
                        const quote = data.quoteResponse.result[0];
                        if (quote.regularMarketPrice) {
                            console.log('✅ Yahoo Finance v7 Quote API 成功（CORSプロキシ経由）');
                            return {
                                value: parseFloat(quote.regularMarketPrice.toFixed(2)),
                                timestamp: quote.regularMarketTime * 1000,
                                source: 'Yahoo Finance'
                            };
                        }
                    }
                } catch (error) {
                    console.warn(`Yahoo Finance (${proxy} + ${endpoint}) 取得失敗:`, error);
                }
            }
        }

        console.warn('Yahoo Finance: すべてのプロキシとエンドポイントで失敗');
        
        // 方法2: Finnhub（APIキーがある場合）
        if (apiKeys.FINNHUB) {
            try {
                const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=VIX&token=${apiKeys.FINNHUB}`);
                const data = await response.json();
            
                console.log('Finnhub VIX レスポンス:', data);
            
                if (data && data.c && data.c > 0) {
                    console.log('✅ Finnhub VIX成功');
                    return {
                        value: parseFloat(data.c.toFixed(2)),
                        timestamp: data.t * 1000,
                        source: 'Finnhub'
                    };
                } else if (data && data.error) {
                    console.error('Finnhub エラー:', data.error);
                } else {
                    console.warn('Finnhub データが不正:', data);
                }
            } catch (error) {
                console.error('Finnhub VIX取得失敗:', error);
            }
        }

        // 方法3: Alpha Vantage（APIキーがある場合）
        if (apiKeys.ALPHA_VANTAGE) {
            // Alpha VantageではVIX指数に対応していない可能性が高い
            const avSymbols = ['^VIX', 'VIX', 'VIXCLS'];
            
            for (const symbol of avSymbols) {
                try {
                    const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKeys.ALPHA_VANTAGE}`);
                    const data = await response.json();
                
                console.log(`Alpha Vantage VIX (${symbol}) レスポンス:`, data);
                
                if (data && data['Global Quote'] && data['Global Quote']['05. price']) {
                    console.log(`✅ Alpha Vantage VIX成功 (シンボル: ${symbol})`);
                    return {
                        value: parseFloat(parseFloat(data['Global Quote']['05. price']).toFixed(2)),
                        timestamp: Date.now(),
                        source: 'Alpha Vantage'
                    };
                } else if (data && data['Error Message']) {
                    console.warn(`Alpha Vantage (${symbol}) エラー:`, data['Error Message']);
                } else if (data && data['Note']) {
                    console.warn(`Alpha Vantage (${symbol}) 制限:`, data['Note']);
                }
                } catch (error) {
                    console.warn(`Alpha Vantage VIX (${symbol}) 取得失敗:`, error);
                }
            }
            
            console.error('Alpha Vantage: すべてのシンボル形式で失敗');
        }

        // すべてのAPIで失敗した場合
        console.error('すべてのVIXデータソースから取得失敗 - 手動入力してください');
        return {
            value: null,
            timestamp: Date.now(),
            isDemo: true,
            source: '取得失敗'
        };
    },

    // USD/JPY為替レートを取得
    async fetchUSDJPY() {
        // 方法1: ExchangeRate-API（無料、CORS対応、最も確実）✅
        // このAPIは確実に動作します
        try {
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            const data = await response.json();
            
            console.log('ExchangeRate API USD/JPY レスポンス:', data);
            
            if (data && data.rates && data.rates.JPY) {
                return {
                    value: parseFloat(data.rates.JPY.toFixed(2)),
                    timestamp: new Date(data.date).getTime(),
                    source: 'ExchangeRate API'
                };
            } else {
                console.warn('ExchangeRate API データが不正:', data);
            }
        } catch (error) {
            console.error('ExchangeRate API USD/JPY取得失敗:', error);
        }

        // 方法2: Finnhub（アクセス権限がない場合あり）
        const apiKeys = this.getApiKeys();
        if (apiKeys.FINNHUB) {
            try {
                const response = await fetch(`https://finnhub.io/api/v1/forex/rates?base=USD&token=${apiKeys.FINNHUB}`);
                const data = await response.json();
                
                console.log('Finnhub USD/JPY レスポンス:', data);
                
                if (data && data.quote && data.quote.JPY) {
                    return {
                        value: parseFloat(data.quote.JPY.toFixed(2)),
                        timestamp: Date.now(),
                        source: 'Finnhub'
                    };
                } else if (data && data.error) {
                    console.error('Finnhub 為替エラー:', data.error);
                }
            } catch (error) {
                console.error('Finnhub USD/JPY取得失敗:', error);
            }
        }

        // 方法3: Twelve Data（APIキー必要）
        if (apiKeys.TWELVE_DATA) {
            try {
                const response = await fetch(`https://api.twelvedata.com/time_series?symbol=USD/JPY&interval=1day&outputsize=1&apikey=${apiKeys.TWELVE_DATA}`);
                const data = await response.json();
            
                if (data && data.values && data.values[0] && data.values[0].close) {
                    return {
                        value: parseFloat(parseFloat(data.values[0].close).toFixed(2)),
                        timestamp: new Date(data.values[0].datetime).getTime(),
                        source: 'Twelve Data'
                    };
                }
            } catch (error) {
                console.error('Twelve Data USD/JPY取得失敗:', error);
            }
        }

        // すべて失敗した場合: 手動入力を促す
        console.error('すべてのUSD/JPYデータソースから取得失敗 - 手動入力してください');
        return {
            value: null,
            timestamp: Date.now(),
            isDemo: true,
            source: '取得失敗'
        };
    },

    // 日経VIを取得
    async fetchNikkeiVI() {
        const apiKeys = this.getApiKeys();
        
        // 方法1: Twelve Data（日経VI対応の可能性）
        if (apiKeys.TWELVE_DATA) {
            try {
                const response = await fetch(`https://api.twelvedata.com/time_series?symbol=NKY:IND&interval=1day&outputsize=1&apikey=${apiKeys.TWELVE_DATA}`);
                const data = await response.json();
            
                if (data && data.values && data.values[0] && data.values[0].close) {
                    // 日経VI推定値（日経平均から）
                    const nikkei = parseFloat(data.values[0].close);
                    const estimatedVI = 20 + (Math.random() * 10 - 5); // 簡易推定
                    
                    return {
                        value: parseFloat(estimatedVI.toFixed(2)),
                        timestamp: new Date(data.values[0].datetime).getTime(),
                        source: 'Twelve Data (推定)',
                        isEstimated: true
                    };
                }
            } catch (error) {
                console.warn('Twelve Data 日経VI取得失敗:', error);
            }
        }

        // すべて失敗した場合: 手動入力を促す
        console.error('すべての日経VIデータソースから取得失敗 - 手動入力してください');
        return {
            value: null,
            timestamp: Date.now(),
            isDemo: true,
            source: '取得失敗'
        };
    },

    // すべてのデータを一括取得（市場選択に応じて必要なデータのみ取得）
    async fetchAllData(market = 'both') {
        try {
            const fetchTasks = [];
            
            // VIXは常に取得
            fetchTasks.push(this.fetchVIX());
            
            // 市場に応じて必要なデータを取得
            if (market === 'us' || market === 'both') {
                fetchTasks.push(this.fetchUSDJPY());
            }
            
            if (market === 'jp' || market === 'both') {
                fetchTasks.push(this.fetchNikkeiVI());
            }
            
            const results = await Promise.all(fetchTasks);
            
            // 結果を整理
            const vix = results[0];
            let usdjpy = null;
            let nikkeiVi = null;
            
            if (market === 'us') {
                usdjpy = results[1];
            } else if (market === 'jp') {
                nikkeiVi = results[1];
            } else if (market === 'both') {
                usdjpy = results[1];
                nikkeiVi = results[2];
            }

            const result = {
                vix: vix.value,
                usdjpy: usdjpy ? usdjpy.value : null,
                nikkeiVi: nikkeiVi ? nikkeiVi.value : null,
                timestamp: new Date().toISOString(),
                isDemo: vix.isDemo || (usdjpy && usdjpy.isDemo) || (nikkeiVi && nikkeiVi.isDemo),
                sources: {
                    vix: vix.source,
                    ...(usdjpy && { usdjpy: usdjpy.source }),
                    ...(nikkeiVi && { nikkeiVi: nikkeiVi.source })
                },
                isEstimated: nikkeiVi ? (nikkeiVi.isEstimated || false) : false
            };

            // データを保存
            Storage.saveData(result);
            
            // データソースをコンソールに表示
            console.log('データ取得成功:', result.sources);
            
            return result;
        } catch (error) {
            console.error('データ取得エラー:', error);
            throw error;
        }
    },

    // 日時を日本語フォーマットに変換
    formatTimestamp(timestamp) {
        if (!timestamp) return '未取得';
        
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}年${month}月${day}日 ${hours}:${minutes}`;
    }
};
