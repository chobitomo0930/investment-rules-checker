// LocalStorage管理
const Storage = {
    KEYS: {
        CONFIG: 'investmentRulesConfig',
        DATA: 'investmentRulesData',
        API_KEYS: 'investmentRulesApiKeys'
    },

    // 設定を保存
    saveConfig(config) {
        try {
            localStorage.setItem(this.KEYS.CONFIG, JSON.stringify(config));
            return true;
        } catch (error) {
            console.error('設定の保存に失敗:', error);
            return false;
        }
    },

    // 設定を読み込み
    loadConfig() {
        try {
            const data = localStorage.getItem(this.KEYS.CONFIG);
            if (data) {
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('設定の読み込みに失敗:', error);
        }
        return null;
    },

    // データを保存
    saveData(data) {
        try {
            localStorage.setItem(this.KEYS.DATA, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('データの保存に失敗:', error);
            return false;
        }
    },

    // データを読み込み
    loadData() {
        try {
            const data = localStorage.getItem(this.KEYS.DATA);
            if (data) {
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('データの読み込みに失敗:', error);
        }
        return null;
    },

    // APIキーを保存
    saveApiKeys(apiKeys) {
        try {
            localStorage.setItem(this.KEYS.API_KEYS, JSON.stringify(apiKeys));
            return true;
        } catch (error) {
            console.error('APIキーの保存に失敗:', error);
            return false;
        }
    },

    // APIキーを読み込み
    loadApiKeys() {
        try {
            const data = localStorage.getItem(this.KEYS.API_KEYS);
            if (data) {
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('APIキーの読み込みに失敗:', error);
        }
        return null;
    },

    // 特定のAPIキーを取得
    getApiKey(keyName) {
        const apiKeys = this.loadApiKeys();
        return apiKeys ? apiKeys[keyName] : null;
    },

    // APIキーが設定されているかチェック
    hasApiKeys() {
        const apiKeys = this.loadApiKeys();
        return apiKeys && (apiKeys.TWELVE_DATA || apiKeys.FINNHUB || apiKeys.ALPHA_VANTAGE);
    },

    // すべてクリア
    clearAll() {
        try {
            localStorage.removeItem(this.KEYS.CONFIG);
            localStorage.removeItem(this.KEYS.DATA);
            localStorage.removeItem(this.KEYS.API_KEYS);
            return true;
        } catch (error) {
            console.error('データのクリアに失敗:', error);
            return false;
        }
    }
};
