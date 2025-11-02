// 設定とデフォルト値
const CONFIG = {
    MAX_ROWS: 5,
    MAX_COLS: 5,
    DEFAULT_VIX_RANGES: [
        { min: 0, max: 12.99, label: 'VIX 12以下' },
        { min: 13, max: 19.99, label: 'VIX 13-19' },
        { min: 20, max: 29.99, label: 'VIX 20-29' },
        { min: 30, max: 39.99, label: 'VIX 30-39' },
        { min: 40, max: 999, label: 'VIX 40+' }
    ],
    DEFAULT_FOREX_RANGES: [
        { min: 0, max: 140.99, label: '円高（140円以下）' },
        { min: 141, max: 154.99, label: '中立（141-154円）' },
        { min: 155, max: 999, label: '円安（155円以上）' }
    ],
    DEFAULT_NIKKEIVI_RANGES: [
        { min: 0, max: 20.99, label: '日経VI 20以下' },
        { min: 21, max: 30.99, label: '日経VI 21-30' },
        { min: 31, max: 40.99, label: '日経VI 31-40' },
        { min: 41, max: 999, label: '日経VI 41+' }
    ],
    DEFAULT_MATRIX_VALUES: {
        us: [
            ['通常\n月5万円', 'やや減額\n月4万円', '減額\n月3万円'],
            ['やや増額\n月6万円', '通常\n月5万円', 'やや減額\n月4万円'],
            ['増額\n月7万円', 'やや増額\n月6万円', '通常\n月5万円'],
            ['大幅増額\n月12万円', '増額\n月8万円', 'やや増額\n月6万円'],
            ['最強買い場\n月15万円', '大幅増額\n月12万円', '増額\n月10万円']
        ],
        jp: [
            ['通常\n月3万円', 'やや減額\n月2万円', '減額\n月1万円'],
            ['やや増額\n月4万円', '通常\n月3万円', 'やや減額\n月2万円'],
            ['増額\n月5万円', 'やや増額\n月4万円', '通常\n月3万円'],
            ['大幅増額\n月8万円', '増額\n月6万円', 'やや増額\n月4万円']
        ]
    }
};

// デフォルト設定を生成する関数
function getDefaultConfig() {
    return {
        market: 'us',
        us: {
            vixRanges: CONFIG.DEFAULT_VIX_RANGES,
            forexRanges: CONFIG.DEFAULT_FOREX_RANGES,
            matrixValues: CONFIG.DEFAULT_MATRIX_VALUES.us
        },
        jp: {
            vixRanges: CONFIG.DEFAULT_VIX_RANGES,
            nikkeiviRanges: CONFIG.DEFAULT_NIKKEIVI_RANGES,
            matrixValues: CONFIG.DEFAULT_MATRIX_VALUES.jp
        }
    };
}

// グローバル変数
let currentConfig = getDefaultConfig();

let currentData = {
    vix: null,
    usdjpy: null,
    nikkeiVi: null,
    timestamp: null
};
